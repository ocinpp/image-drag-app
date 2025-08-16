<!-- src/components/NamedZoneImageDrag.vue -->
<template>
  <div class="drag-drop-container">
    <!-- Emotion Zones Container (for export) - only emotion zones -->
    <div ref="exportContainer" class="emotion-zones-container">
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
    </div>
    
    <!-- Starting Drag Zone (outside export container) -->
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
    
    <!-- Export Button - shown when all items are distributed -->
    <div v-if="allItemsDistributed" class="export-section">
      <button 
        @click="exportAsImage" 
        class="export-button"
        :disabled="isExporting"
      >
        {{ isExporting ? 'Exporting...' : 'Export as Image' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import html2canvas from "html2canvas";
import { ImageService } from "../services/imageService.js";

// Define drop zones with names and items
const zones = ref([
  {
    name: "Item",
    items: [], // Will be populated from service
  },
  { name: "Relaxed", items: [] },
  { name: "Blessed", items: [] },
  { name: "Excited", items: [] },
  { name: "Enlightened", items: [] },
]);

// Loading state for images
const isLoadingImages = ref(true);

const onChange = (index, event) => {
  console.log(
    `Zone "${zones.value[index].name}" updated:`,
    event,
    zones.value.map((z) => ({ name: z.name, items: z.items }))
  );
};

// Template refs
const exportContainer = ref(null);
const isExporting = ref(false);



// Check if all items have been moved from the "Item" zone
const allItemsDistributed = computed(() => {
  return zones.value[0].items.length === 0;
});

// Check if images are already loaded and ensure they're ready for export
const ensureImagesLoaded = async () => {
  const imageElements = exportContainer.value?.querySelectorAll('img') || [];
  
  const checkImageLoaded = (imgElement) => {
    return new Promise((resolve) => {
      // If image is already loaded, resolve immediately
      if (imgElement.complete && imgElement.naturalHeight !== 0) {
        resolve();
        return;
      }
      
      // If not loaded, wait for it to load
      const onLoad = () => {
        imgElement.removeEventListener('load', onLoad);
        imgElement.removeEventListener('error', onError);
        resolve();
      };
      
      const onError = () => {
        imgElement.removeEventListener('load', onLoad);
        imgElement.removeEventListener('error', onError);
        console.warn(`Failed to load image: ${imgElement.src}`);
        resolve(); // Continue even if image fails
      };
      
      imgElement.addEventListener('load', onLoad);
      imgElement.addEventListener('error', onError);
      
      // Force reload if needed (but this should be rare since images are already in DOM)
      if (!imgElement.src) {
        imgElement.src = imgElement.getAttribute('src');
      }
    });
  };
  
  // Wait for all images with a small stagger to avoid server overload
  const loadPromises = Array.from(imageElements).map((img, index) => {
    return new Promise(resolve => {
      setTimeout(async () => {
        await checkImageLoaded(img);
        resolve();
      }, index * 50); // Smaller delay since images should already be loaded
    });
  });
  
  await Promise.all(loadPromises);
};

// Export function to capture the emotion zones as an image
const exportAsImage = async () => {
  if (!exportContainer.value || isExporting.value) return;
  
  isExporting.value = true;
  
  try {
    // Ensure all images in the DOM are loaded (avoid duplicate loading)
    await ensureImagesLoaded();
    
    // Wait a bit for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const canvas = await html2canvas(exportContainer.value, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: exportContainer.value.scrollWidth,
      height: exportContainer.value.scrollHeight,
      imageTimeout: 15000, // Increase timeout for slow loading images
      removeContainer: false
    });
    
    // Convert to blob and download using a cleaner approach
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `emotion-results-${new Date().toISOString().split('T')[0]}.png`;
        link.style.display = 'none';
        
        // Trigger download without adding to DOM
        link.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      }
    }, 'image/png');
    
  } catch (error) {
    console.error('Error exporting image:', error);
    alert('Export failed. Please try again in a moment.');
  } finally {
    isExporting.value = false;
  }
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

// Load images from service when component mounts
const loadImages = async () => {
  isLoadingImages.value = true;
  try {
    const result = await ImageService.getImages();
    if (result.success) {
      zones.value[0].items = result.data;
      console.log('Images loaded successfully:', result.data.length, 'items');
    } else {
      console.error('Failed to load images:', result.error);
    }
  } catch (error) {
    console.error('Error loading images:', error);
  } finally {
    isLoadingImages.value = false;
  }
};

onMounted(() => {
  loadImages();
});
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

.export-section {
  @apply w-full mb-4 flex justify-center;
}

.export-button {
  @apply bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.emotion-zones-container {
  @apply w-full;
}

/* Override oklch colors for html2canvas compatibility */
.emotion-zones-container .drop-zone {
  background-color: #f9fafb !important; /* gray-50 */
  border-color: #d1d5db !important; /* gray-300 */
}

.emotion-zones-container .start-zone {
  background-color: #eff6ff !important; /* blue-50 */
  border-color: #3b82f6 !important; /* blue-500 */
}

.emotion-zones-container .image-item {
  background-color: #ffffff !important; /* white */
  border-color: #e5e7eb !important; /* gray-200 */
}

.emotion-zones-container .zone-title {
  color: #1f2937 !important; /* gray-800 */
}
</style>
