let documentContext = "";

export const documentStore = {
  set(text) {
    documentContext = text || "";
  },
  get() {
    return documentContext;
  },
  clear() {
    documentContext = "";
  },
};
