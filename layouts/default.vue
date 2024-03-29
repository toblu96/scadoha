<template>
  <div class="flex h-full flex-col">
    <!-- Top nav-->
    <header class="relative flex h-16 flex-shrink-0 items-center bg-white">
      <!-- Logo area -->
      <div class="absolute inset-y-0 left-0 md:static md:flex-shrink-0">
        <a
          href="#"
          class="flex h-16 w-16 items-center justify-center bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 md:w-20"
        >
          <img
            class="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=white"
            alt="Your Company"
          />
        </a>
      </div>

      <!-- Picker area -->
      <div class="mx-auto md:hidden">
        <div class="relative">
          <label for="inbox-select" class="sr-only">Choose inbox</label>
          <select
            id="inbox-select"
            class="rounded-md border-0 bg-none pl-3 pr-8 text-base font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600"
          >
            <option
              v-for="item in sidebarNavigation"
              :key="item.name"
              :selected="item.current"
            >
              {{ item.name }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-2"
          >
            <ChevronDownIcon class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>

      <!-- Menu button area -->
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-6 md:hidden"
      >
        <!-- Mobile menu button -->
        <button
          type="button"
          class="-mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          @click="mobileMenuOpen = true"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="block h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <!-- Desktop nav area -->
      <div
        class="hidden md:flex md:min-w-0 md:flex-1 md:items-center md:justify-between"
      >
        <div class="min-w-0 flex-1">
          <!-- <div
            class="relative max-w-2xl text-gray-400 focus-within:text-gray-500"
          >
            <label for="desktop-search" class="sr-only">Search</label>
            <input
              id="desktop-search"
              type="search"
              placeholder="Search"
              class="block w-full border-transparent pl-12 placeholder-gray-500 focus:border-transparent focus:ring-0 sm:text-sm"
            />
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-4"
            >
              <MagnifyingGlassIcon class="h-5 w-5" aria-hidden="true" />
            </div>
          </div> -->
        </div>
        <div class="ml-10 flex flex-shrink-0 items-center space-x-10 pr-4">
          <nav aria-label="Global" class="flex space-x-10">
            <a
              v-for="nav in navigation"
              :key="nav.name"
              :href="nav.href"
              class="text-sm font-medium text-gray-900"
              >{{ nav.name }}</a
            >
          </nav>
          <div class="flex items-center space-x-8">
            <span class="inline-flex">
              <a
                href="#"
                class="-mx-1 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500"
              >
                <span class="sr-only">View notifications</span>
                <BellIcon class="h-6 w-6" aria-hidden="true" />
              </a>
            </span>

            <Menu as="div" class="relative inline-block text-left">
              <MenuButton
                class="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                <span class="sr-only">Open user menu</span>
                <img
                  v-if="user?.imageUrl != ''"
                  class="h-8 w-8 rounded-full object-cover"
                  :src="user?.imageUrl"
                  alt=""
                />
                <span
                  v-else
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500"
                >
                  <span class="text-sm font-medium leading-none text-white">{{
                    user.acronym
                  }}</span>
                </span>
              </MenuButton>

              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  <div class="py-1">
                    <MenuItem v-slot="{ active }">
                      <a
                        href="#"
                        :class="[
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700',
                        ]"
                        >Your Profile</a
                      >
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <button
                        @click="logout"
                        :class="[
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700',
                        ]"
                        class="w-full text-left"
                      >
                        Sign Out
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide this `div` based on menu open/closed state -->
      <TransitionRoot as="template" :show="mobileMenuOpen">
        <Dialog
          as="div"
          class="relative z-40 md:hidden"
          @close="mobileMenuOpen = false"
        >
          <TransitionChild
            as="template"
            enter="transition-opacity ease-linear duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div
              class="hidden sm:fixed sm:inset-0 sm:block sm:bg-gray-600 sm:bg-opacity-75"
            />
          </TransitionChild>

          <div class="fixed inset-0 z-40">
            <TransitionChild
              as="template"
              enter="transition ease-out duration-150 sm:ease-in-out sm:duration-300"
              enter-from="transform opacity-0 scale-110 sm:translate-x-full sm:scale-100 sm:opacity-100"
              enter-to="transform opacity-100 scale-100  sm:translate-x-0 sm:scale-100 sm:opacity-100"
              leave="transition ease-in duration-150 sm:ease-in-out sm:duration-300"
              leave-from="transform opacity-100 scale-100 sm:translate-x-0 sm:scale-100 sm:opacity-100"
              leave-to="transform opacity-0 scale-110  sm:translate-x-full sm:scale-100 sm:opacity-100"
            >
              <DialogPanel
                class="fixed inset-0 z-40 h-full w-full bg-white sm:inset-y-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-sm sm:shadow-lg"
                aria-label="Global"
              >
                <div
                  class="flex h-16 items-center justify-between px-4 sm:px-6"
                >
                  <a href="#">
                    <img
                      class="block h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                      alt="Your Company"
                    />
                  </a>
                  <button
                    type="button"
                    class="-mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    @click="mobileMenuOpen = false"
                  >
                    <span class="sr-only">Close main menu</span>
                    <XMarkIcon class="block h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <!-- <div class="max-w-8xl mx-auto mt-2 px-4 sm:px-6">
                  <div
                    class="relative text-gray-400 focus-within:text-gray-500"
                  >
                    <label for="mobile-search" class="sr-only"
                      >Search all inboxes</label
                    >
                    <input
                      id="mobile-search"
                      type="search"
                      placeholder="Search all inboxes"
                      class="block w-full rounded-md border-gray-300 pl-10 placeholder-gray-500 focus:border-indigo-600 focus:ring-indigo-600"
                    />
                    <div
                      class="absolute inset-y-0 left-0 flex items-center justify-center pl-3"
                    >
                      <MagnifyingGlassIcon class="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>
                </div> -->
                <div class="max-w-8xl mx-auto py-3 px-2 sm:px-4">
                  <template v-for="item in navigation" :key="item.name">
                    <a
                      :href="item.href"
                      class="block rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-100"
                      >{{ item.name }}</a
                    >
                    <a
                      v-for="child in item.children"
                      :key="child.name"
                      :href="child.href"
                      class="block rounded-md py-2 pl-5 pr-3 text-base font-medium text-gray-500 hover:bg-gray-100"
                      >{{ child.name }}</a
                    >
                  </template>
                </div>
                <div class="border-t border-gray-200 pt-4 pb-3">
                  <div class="max-w-8xl mx-auto flex items-center px-4 sm:px-6">
                    <div class="flex-shrink-0">
                      <img
                        v-if="user?.imageUrl != ''"
                        class="h-10 w-10 rounded-full object-cover"
                        :src="user?.imageUrl"
                        alt=""
                      />
                      <span
                        v-else
                        class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500"
                      >
                        <span class="font-medium leading-none text-white">{{
                          user.acronym
                        }}</span>
                      </span>
                    </div>
                    <div class="ml-3 min-w-0 flex-1">
                      <div class="truncate text-base font-medium text-gray-800">
                        {{ user?.name }}
                      </div>
                      <div class="truncate text-sm font-medium text-gray-500">
                        {{ user?.email }}
                      </div>
                    </div>
                    <a
                      href="#"
                      class="ml-auto flex-shrink-0 bg-white p-2 text-gray-400 hover:text-gray-500"
                    >
                      <span class="sr-only">View notifications</span>
                      <BellIcon class="h-6 w-6" aria-hidden="true" />
                    </a>
                  </div>
                  <div class="max-w-8xl mx-auto mt-3 space-y-1 px-2 sm:px-4">
                    <a
                      href="#"
                      class="block rounded-md py-2 px-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                      >Your Profile</a
                    >
                    <button
                      @click="logout"
                      class="block w-full rounded-md py-2 px-3 text-left text-base font-medium text-gray-900 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </TransitionRoot>
    </header>

    <!-- Bottom section -->
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <!-- Narrow sidebar-->
      <nav
        aria-label="Sidebar"
        class="hidden md:block md:flex-shrink-0 md:overflow-y-auto md:bg-gray-800"
      >
        <div class="relative flex w-20 flex-col space-y-3 p-3">
          <a
            v-for="item in sidebarNavigation"
            :key="item.name"
            :href="item.href"
            :class="[
              item.current
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:bg-gray-700',
              'inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg',
            ]"
          >
            <span class="sr-only">{{ item.name }}</span>
            <component :is="item.icon" class="h-6 w-6" aria-hidden="true" />
          </a>
        </div>
      </nav>

      <!-- Main area -->
      <main class="w-full overflow-y-auto">
        <div
          class="mx-auto min-w-0 max-w-6xl flex-1 border-t border-gray-200 p-4 lg:flex"
        >
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import {
  ArchiveBoxIcon,
  Bars3Icon,
  BellIcon,
  FlagIcon,
  InboxIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

interface IUser {
  name: string;
  email: string;
  imageUrl: string;
  acronym: string;
}

// load user data
const user = ref<IUser>();
const pocketbase_user = usePocketbaseUser();
user.value = {
  imageUrl: pocketbase_user.value?.avatar as string,
  email: pocketbase_user.value?.email || "no email provided",
  name: pocketbase_user.value?.username as string,
  acronym: pocketbase_user.value?.username.slice(0, 2).toUpperCase() || "NA",
};

const navigation = [
  // {
  //   name: "Inboxes",
  //   href: "#",
  //   children: [
  //     { name: "Technical Support", href: "#" },
  //     { name: "Sales", href: "#" },
  //     { name: "General", href: "#" },
  //   ],
  // },
  { name: "Projects", href: "/", children: [] },
  { name: "Settings", href: "#", children: [] },
];
const sidebarNavigation = [
  { name: "Open", href: "#", icon: InboxIcon, current: true },
  { name: "Archive", href: "#", icon: ArchiveBoxIcon, current: false },
  { name: "Customers", href: "#", icon: UserCircleIcon, current: false },
  { name: "Flagged", href: "#", icon: FlagIcon, current: false },
  { name: "Spam", href: "#", icon: NoSymbolIcon, current: false },
  { name: "Drafts", href: "#", icon: PencilSquareIcon, current: false },
];

const mobileMenuOpen = ref(false);

const logout = async () => {
  try {
    useNuxtApp().$pb.authStore.clear();
  } catch (error: any) {
    console.error(error.message);
  }
};
</script>

<style>
html {
  @apply h-full overflow-hidden bg-gray-100;
}

body {
  @apply h-full;
}

#__nuxt {
  @apply h-full overflow-hidden;
}
</style>
