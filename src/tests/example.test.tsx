import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'
import '@testing-library/jest-dom/vitest';

describe('Find all the testid', () => {
    it('find buttons, labels, containers, icons', () => {
        render(<App />)
        expect(screen.getByTestId('words-card-container')).toBeInTheDocument();
        expect(screen.getByTestId('floating-left-buttons')).toBeInTheDocument();
        expect(screen.getByTestId('upload-file-button')).toBeInTheDocument();
        expect(screen.getByTestId('words-is-theme-dark-button')).toBeInTheDocument();
        expect(screen.getByTestId('words-progress-status-label')).toBeInTheDocument();
        expect(screen.getByTestId('floating-right-buttons')).toBeInTheDocument();
        expect(screen.getByTestId('reveal-description-button')).toBeInTheDocument();
        expect(screen.getByTestId('reveal-phonetic-button')).toBeInTheDocument();
        expect(screen.getByTestId('words-chinese-container')).toBeInTheDocument();
        expect(screen.getByTestId('words-traditional-label')).toBeInTheDocument();
        expect(screen.getByTestId('words-simplified-label')).toBeInTheDocument();
        expect(screen.getByTestId('words-description-label')).toBeInTheDocument();
        expect(screen.getByTestId('prev-words-card-button')).toBeInTheDocument();
        expect(screen.getByTestId('words-input-box')).toBeInTheDocument();
        expect(screen.getByTestId('words-check-mark-icon')).toBeInTheDocument();
        expect(screen.getByTestId('next-words-card-button')).toBeInTheDocument();
    })
})