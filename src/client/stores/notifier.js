import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useNotifierStore = defineStore('notifier', () => {
  const messages = ref([]);

  function addTemp(message) {
    const messageDoc = message;
    const messageId = new Date().getTime();
    messageDoc.id = messageId;
    messages.value.push(messageDoc);
    const timerId = setTimeout(() => {
      const index = messages.value.findIndex(x => x.id === messageId);
      if (index > -1) messages.value.splice(index, 1);
      clearTimeout(timerId);
    }, 4000);
  }

  function addPerm(message) {
    const messageDoc = message;
    const messageId = new Date().getTime();
    messageDoc.id = messageId;
    messages.value.push(messageDoc);
  }

  function removeMessage(messageId) {
    const index = messages.value.findIndex(x => x.id === messageId);
    if (index > -1) messages.value.splice(index, 1);
  }

  return { messages, addTemp, addPerm, removeMessage };
});
