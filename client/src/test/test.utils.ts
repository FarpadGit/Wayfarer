export function getSpyProperty<T>(
  spy: jasmine.SpyObj<T>,
  propertyName: string
) {
  return Object.getOwnPropertyDescriptor(spy, propertyName);
}

export function setSpyProperty<T>(
  spy: jasmine.SpyObj<T>,
  propertyName: string,
  newValue: any
) {
  (
    Object.getOwnPropertyDescriptor(spy, propertyName)?.get as jasmine.Spy
  ).and.returnValue(newValue);
}

export function acceptDeleteConfirmDialogAnd(callback: (() => void) | null) {
  const confirmDialogElement = document.querySelector('.delete-dialog');
  const confirmButton = confirmDialogElement?.querySelector(
    '[data-test-confirm-btn]'
  ) as HTMLButtonElement;
  confirmButton?.click();

  if (callback == null) return;

  setTimeout(() => {
    callback();
  }, 0);
}
