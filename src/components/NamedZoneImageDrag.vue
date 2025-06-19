<!-- src/components/NamedZoneImageDrag.vue -->
<template>
  <div class="drag-drop-container">
    <!-- Target Drop Zones -->
    <div
      v-for="(zone, index) in zones.slice(1)"
      :key="index"
      class="flex flex-row gap-2 w-full"
    >
      <h3
        class="zone-title min-w-[80px] max-w-[80px] sm:min-w-[100px] sm:max-w-[100px] wrap-break-word"
      >
        {{ zone.name }}
      </h3>
      <div class="drop-zone">
        <VueDraggable
          v-model="zone.items"
          group="images"
          :animation="100"
          chosenClass="chosen"
          ghostClass="ghost"
          item-key="id"
          class="image-list"
          @change="onChange(index + 1, $event)"
        >
          <div
            v-for="element in zone.items"
            :key="element.id"
            class="image-item"
          >
            <img
              :src="element.url"
              :alt="element.name"
              class="image-img"
              loading="lazy"
            />
            <!-- <span class="image-name">{{ element.name }}</span> -->
          </div>
        </VueDraggable>
      </div>
    </div>
    <!-- Starting Drag Zone -->
    <div class="flex flex-row gap-2 w-full">
      <h3
        class="zone-title min-w-[80px] max-w-[80px] sm:min-w-[100px] sm:max-w-[100px] wrap-break-word"
      >
        {{ zones[0].name }}
      </h3>
      <div class="drop-zone start-zone">
        <VueDraggable
          v-model="zones[0].items"
          group="images"
          :animation="100"
          chosenClass="chosen"
          ghostClass="ghost"
          item-key="id"
          class="image-list"
          :no-drop="true"
          @change="onChange(0, $event)"
        >
          <div
            v-for="element in zones[0].items"
            :key="element.id"
            class="image-item"
          >
            <img
              :src="element.url"
              :alt="element.name"
              class="image-img"
              loading="lazy"
            />
            <!-- <span class="image-name">{{ element.name }}</span> -->
          </div>
        </VueDraggable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueDraggable } from "vue-draggable-plus";

// Define drop zones with names and items
const zones = ref([
  {
    name: "Item",
    items: [
      {
        id: 1,
        name: "Image 1",
        url: "https://picsum.photos/100?random=1",
      },
      {
        id: 2,
        name: "Image 2",
        url: "https://picsum.photos/100?random=2",
      },
      {
        id: 3,
        name: "Image 3",
        url: "https://picsum.photos/100?random=3",
      },
      {
        id: 4,
        name: "Image 4",
        url: "https://picsum.photos/100?random=4",
      },
      {
        id: 5,
        name: "Image 5",
        url: "https://picsum.photos/100?random=5",
      },
      {
        id: 6,
        name: "Image 6",
        url: "https://picsum.photos/100?random=6",
      },
    ],
  },
  { name: "Relaxed", items: [] },
  { name: "Blessed", items: [] },
  { name: "Excited", items: [] },
  { name: "Enlightened", items: [] },
]);

const onChange = (index, event) => {
  console.log(
    `Zone "${zones.value[index].name}" updated:`,
    event,
    zones.value.map((z) => ({ name: z.name, items: z.items }))
  );
};

const handleFileDrop = (event) => {
  const files = event.dataTransfer.files;
  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      zones.value[0].items.push({
        id: Date.now(),
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
  });
};
</script>

<style scoped>
@reference "../style.css";

.drag-drop-container {
  @apply container mx-auto flex flex-wrap gap-2 p-2;
}

.drop-zone {
  @apply w-full min-h-[100px] md:min-h-[120px] border-2 border-dashed border-gray-300 p-2 bg-gray-50 rounded-lg overflow-auto;
}

.start-zone {
  @apply bg-blue-50 border-blue-500;
}

.upload-zone {
  @apply bg-orange-50 border-orange-500 flex items-center justify-center;
}

.image-list {
  @apply flex flex-row gap-2 h-full min-w-max items-center;
}

.image-item {
  @apply items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-sm cursor-move hover:bg-gray-100 transition-colors;
}

.image-img {
  @apply size-16 md:size-20 object-cover rounded;
}

.image-name {
  @apply text-sm font-medium text-gray-700;
}

.zone-title {
  @apply text-base font-semibold text-gray-800 mb-2;
}

.sortable-ghost {
  @apply opacity-50 bg-blue-100;
}

.dragging {
  @apply opacity-70 scale-110 shadow-lg;
}
</style>
