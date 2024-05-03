export const localStorageRename = (oldName: string, newName: string) => {
  const value = localStorage.getItem(oldName);
  if (value) {
    localStorage.setItem(newName, value );
  }
  localStorage.removeItem(oldName);
};