<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Usuarios</h2>
      <span class="text-sm text-dark-400">{{ meta?.total ?? 0 }} usuarios en total</span>
    </div>

    <!-- Search -->
    <div class="relative max-w-sm">
      <span class="absolute inset-y-0 left-3 flex items-center text-dark-400">🔍</span>
      <input
        v-model="search"
        type="text"
        class="input pl-9 w-full"
        placeholder="Buscar por nombre o email..."
        @input="debouncedLoad"
      />
    </div>

    <!-- Table skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 8" :key="i" class="skeleton h-14 rounded-xl" />
    </div>

    <!-- Table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-dark-800 border-b border-dark-700">
            <tr>
              <th class="text-left px-4 py-3 text-dark-300 font-semibold">ID</th>
              <th class="text-left px-4 py-3 text-dark-300 font-semibold">Nombre</th>
              <th class="text-left px-4 py-3 text-dark-300 font-semibold">Email</th>
              <th class="text-left px-4 py-3 text-dark-300 font-semibold">Rol</th>
              <th class="text-left px-4 py-3 text-dark-300 font-semibold">Registrado</th>
              <th class="text-center px-4 py-3 text-dark-300 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-dark-800">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-dark-800/50 transition-colors"
              :class="{ 'opacity-50': user.id === authStore.user?.id }"
            >
              <td class="px-4 py-3 text-dark-500 font-mono text-xs">#{{ user.id }}</td>
              <td class="px-4 py-3 font-medium text-dark-100">{{ user.name }}</td>
              <td class="px-4 py-3 text-dark-400">{{ user.email }}</td>
              <td class="px-4 py-3">
                <span
                  :class="
                    isAdmin(user)
                      ? 'badge bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'badge bg-dark-700 text-dark-400 border border-dark-600'
                  "
                >
                  {{ isAdmin(user) ? '🛡️ Admin' : '👤 Usuario' }}
                </span>
              </td>
              <td class="px-4 py-3 text-dark-400 text-xs">{{ formatDate(user.created_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button
                    :disabled="user.id === authStore.user?.id || toggling === user.id"
                    :class="[
                      'btn btn-secondary btn-sm px-3 disabled:opacity-40 disabled:cursor-not-allowed',
                    ]"
                    :title="isAdmin(user) ? 'Quitar admin' : 'Hacer admin'"
                    @click="toggleRole(user)"
                  >
                    {{
                      toggling === user.id
                        ? '...'
                        : isAdmin(user)
                          ? '↓ Quitar admin'
                          : '↑ Hacer admin'
                    }}
                  </button>
                  <button
                    :disabled="user.id === authStore.user?.id"
                    class="btn btn-danger btn-sm px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Eliminar usuario"
                    @click="confirmDelete(user)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-dark-500">
                No se encontraron usuarios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination v-if="meta" :current-page="page" :total-pages="meta.totalPages" @change="load" />

    <ConfirmModal
      :show="!!deletingUser"
      title="Eliminar usuario"
      :message="`¿Eliminar a '${deletingUser?.name}' (${deletingUser?.email})? Esta acción no se puede deshacer.`"
      icon="🗑️"
      confirm-text="Eliminar"
      :danger-confirm="true"
      @confirm="deleteUser"
      @cancel="deletingUser = null"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminUser, PaginatedResponse } from '~/types';

definePageMeta({ layout: 'admin' });
useSeoMeta({ title: 'Usuarios — ShopFlow Admin' });

const api = useApi();
const authStore = useAuthStore();
const { $toast } = useNuxtApp();

const users = ref<AdminUser[]>([]);
const meta = ref<PaginatedResponse<AdminUser>['meta'] | null>(null);
const loading = ref(true);
const page = ref(1);
const search = ref('');
const toggling = ref<number | null>(null);
const deletingUser = ref<AdminUser | null>(null);

function isAdmin(user: AdminUser) {
  return user.roles.includes('ROLE_ADMIN');
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

async function load(newPage = 1) {
  page.value = newPage;
  loading.value = true;
  try {
    const params: Record<string, string | number | boolean> = { page: page.value, limit: 20 };
    if (search.value) {
      params.search = search.value;
    }
    const result = await api.get<PaginatedResponse<AdminUser>>('/admin/users', params);
    users.value = result.data;
    meta.value = result.meta;
  } finally {
    loading.value = false;
  }
}

let debounceTimer: ReturnType<typeof setTimeout>;
function debouncedLoad() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => load(1), 350);
}

async function toggleRole(user: AdminUser) {
  toggling.value = user.id;
  try {
    const newRoles = isAdmin(user) ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_ADMIN'];
    const updated = await api.patch<AdminUser>(`/admin/users?id=${user.id}`, { roles: newRoles });
    const idx = users.value.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users.value[idx] = updated;
    }
    ($toast as any).success(
      isAdmin(updated)
        ? `${user.name} ahora es administrador`
        : `${user.name} ya no es administrador`,
    );
  } catch (err: unknown) {
    ($toast as any).error(err instanceof Error ? err.message : 'Error');
  } finally {
    toggling.value = null;
  }
}

function confirmDelete(user: AdminUser) {
  deletingUser.value = user;
}

async function deleteUser() {
  if (!deletingUser.value) {
    return;
  }
  const name = deletingUser.value.name;
  try {
    await api.del(`/admin/users?id=${deletingUser.value.id}`);
    ($toast as any).success(`Usuario '${name}' eliminado`);
    deletingUser.value = null;
    await load(page.value);
  } catch (err: unknown) {
    ($toast as any).error(err instanceof Error ? err.message : 'Error');
  }
}

onMounted(() => load());
</script>
