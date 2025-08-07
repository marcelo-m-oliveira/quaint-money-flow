// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom'

// Extend Jest matchers with Testing Library DOM matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(className: string): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveValue(value: string | number): R
      toBeChecked(): R
      toHaveFocus(): R
      toBeEmptyDOMElement(): R
      toBeInvalid(): R
      toBeValid(): R
      toHaveStyle(css: string | Record<string, any>): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
    }
  }
}

// Also extend expect for better TypeScript support
declare module '@jest/expect' {
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveClass(className: string): R
    toHaveAttribute(attr: string, value?: string): R
    toHaveTextContent(text: string | RegExp): R
    toBeVisible(): R
    toBeDisabled(): R
    toBeEnabled(): R
    toHaveValue(value: string | number): R
    toBeChecked(): R
    toHaveFocus(): R
    toBeEmptyDOMElement(): R
    toBeInvalid(): R
    toBeValid(): R
    toHaveStyle(css: string | Record<string, any>): R
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
  }
}

export {}
