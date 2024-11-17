export const insertDotByPosition = (input: number, position: number) => {
  const withDot =
    `${input}`.slice(0, position) + "." + `${input}`.slice(position);
  return Number(withDot);
};

export const exceptionSnapShotEvent = (e: KeyboardEvent) =>
  e.target instanceof HTMLInputElement ? false : true;

export const downloadBlobFile = (data: Blob, fileName: string) => {
  const downloadURL = window.URL.createObjectURL(data);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadURL;
  downloadLink.download = fileName;
  downloadLink.click();

  // clear memory
  downloadLink.remove();
  window.URL.revokeObjectURL(downloadURL);
};
