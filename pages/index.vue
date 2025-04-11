<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">📋 Quản lý phòng</h1>

    <!-- Search -->
    <input v-model="search" @input="fetchRooms" class="border px-3 py-1 mb-4 w-full" placeholder="🔍 Tìm phòng..." />

    <!-- Add room -->
    <form @submit.prevent="addRoom" class="mb-4 space-x-2">
      <input v-model="newRoom.name" placeholder="Tên phòng" class="border px-2 py-1" />
      <input v-model.number="newRoom.price" placeholder="Giá" type="number" class="border px-2 py-1" />
      <input type="file" ref="fileInput" @change="handleFileChange" />
      <button class="bg-blue-500 text-white px-3 py-1 rounded">➕ Thêm</button>
    </form>

    <!-- Export -->
    <button @click="exportCSV" class="bg-green-500 text-white px-3 py-1 rounded mb-4">⬇️ Xuất CSV</button>

    <!-- Table -->
    <table class="w-full border">
      <thead>
      <tr class="bg-gray-100">
        <th class="p-2 border">ID</th>
        <th class="p-2 border">Ảnh</th>
        <th class="p-2 border">Tên</th>
        <th class="p-2 border">Giá</th>
        <th class="p-2 border">Thao tác</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="room in rooms" :key="room.id">
        <td class="p-2 border">{{ room.id }}</td>

        <!-- Ảnh -->
        <td class="p-2 border">
          <img
              :src="room.image.replace('/upload/', '/upload/w_120,h_80,c_fill/')"
              class="rounded shadow"
              loading="lazy"
              width="120"
              height="80"
          />
        </td>

        <!-- Tên phòng -->
        <td class="p-2 border">
          <template v-if="editingRoom?.id === room.id">
            <input v-model="editingRoom.name" class="border px-2 py-1 w-full" />
          </template>
          <template v-else>
            {{ room.name }}
          </template>
        </td>

        <!-- Giá -->
        <td class="p-2 border">
          <template v-if="editingRoom?.id === room.id">
            <input v-model.number="editingRoom.price" type="number" class="border px-2 py-1 w-full" />
          </template>
          <template v-else>
            ${{ room.price }}
          </template>
        </td>

        <!-- Thao tác -->
        <td class="p-2 border space-x-2">
          <template v-if="editingRoom?.id === room.id">
            <!-- NEW: input hình ảnh -->
            <input type="file" @change="handleEditFileChange" class="mb-1" />

            <button @click="saveEdit" class="bg-green-500 text-white px-2 py-1 rounded">💾 Lưu</button>
            <button @click="cancelEdit" class="bg-gray-400 px-2 py-1 rounded">✖ Hủy</button>
          </template>
          <template v-else>
            <button @click="startEdit(room)" class="bg-yellow-400 text-white px-2 py-1 rounded">✏️ Sửa</button>
            <button @click="deleteRoom(room.id)" class="bg-red-500 text-white px-2 py-1 rounded">🗑 Xóa</button>
          </template>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const search = ref('')
const editingRoom = ref(null)
const fileInput = ref(null)

const { data: rooms, refresh } = await useAsyncData('rooms', () =>
    $fetch('/api/rooms', {
      params: {
        search: search.value
      }
    })
)

// Tìm kiếm phòng
watch(search, () => {
  refresh() // mỗi khi search thay đổi → tự fetch lại
})

// Thêm phòng mới
const newRoom = ref({ name: '', price: 0, image: '' })

// Xóa phòng
async function deleteRoom(id) {
  if (confirm('Bạn có chắc muốn xóa phòng này?')) {
    await $fetch(`/api/rooms/${id}`, { method: 'DELETE' })
    refresh()
  }
}

// Xuất CSV
function exportCSV() {
  const headers = ['ID', 'Tên phòng', 'Giá']
  const rows = (rooms.value || []).map(r => [r.id, r.name, r.price])
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'rooms.csv'
  link.click()
}


function startEdit(room) {
  editingRoom.value = { ...room }
}

function cancelEdit() {
  editingRoom.value = null
}

const selectedFile = ref(null)

function handleFileChange(event) {
  selectedFile.value = event.target.files[0]
}

async function addRoom() {
  let imageUrl = ''
  if (selectedFile.value) {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const res = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    imageUrl = res.url
  }

  await $fetch('/api/rooms', {
    method: 'POST',
    body: {
      ...newRoom.value,
      image: imageUrl
    }
  })

  newRoom.value = { name: '', price: 0, image: '' }
  selectedFile.value = null

  if (fileInput.value) fileInput.value.value = ''

  refresh()
}

const editFile = ref(null)

function handleEditFileChange(event) {
  editFile.value = event.target.files[0]
}

async function saveEdit() {
  let imageUrl = editingRoom.value.image

  if (editFile.value) {
    const formData = new FormData()
    formData.append('file', editFile.value)
    const res = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    imageUrl = res.url
  }

  await $fetch(`/api/rooms/${editingRoom.value.id}`, {
    method: 'PUT',
    body: {
      name: editingRoom.value.name,
      price: editingRoom.value.price,
      image: imageUrl
    }
  })

  editingRoom.value = null
  editFile.value = null
  refresh()
}

</script>
