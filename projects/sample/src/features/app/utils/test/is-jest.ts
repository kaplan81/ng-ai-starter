/// <reference types="jest" />
export function isJest(): boolean {
  return typeof jest !== 'undefined';
}
