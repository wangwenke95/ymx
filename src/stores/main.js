import { defineStore } from 'pinia'
import {computed, ref} from "vue";

export const useMainStore = defineStore('counter', () => {
    const text=ref('')

    return { text }
})
