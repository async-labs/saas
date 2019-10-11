function resizeImage(file: File, MAX_WIDTH, MAX_HEIGHT) {
  const img = document.createElement('img');
  const canvas = document.createElement('canvas');

  const resize = resolve => () => {
    let isResizeNeeded = false;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        isResizeNeeded = true;
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        isResizeNeeded = true;
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }

    if (isResizeNeeded) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        resolve(blob);
      }, file.type);
    } else {
      resolve(file);
    }
  };

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result.toString();

      img.onload = resize(resolve);
    };

    reader.readAsDataURL(file);
  });
}

export { resizeImage };
