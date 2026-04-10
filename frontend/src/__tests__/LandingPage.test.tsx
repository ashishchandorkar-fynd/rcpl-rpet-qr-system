import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLanding() {
  return render(<MemoryRouter><LandingPage /></MemoryRouter>)
}

describe('LandingPage', () => {
  it('renders RCPL title and branding', () => {
    renderLanding()
    expect(screen.getByText('RCPL')).toBeInTheDocument()
    expect(screen.getByText(/rPET Product Information/i)).toBeInTheDocument()
  })

  it('renders instructions text', () => {
    renderLanding()
    expect(screen.getByText(/batch number printed on the neck/i)).toBeInTheDocument()
  })

  it('renders batch code input and submit button', () => {
    renderLanding()
    expect(screen.getByPlaceholderText(/e\.g\. AA/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get product details/i })).toBeInTheDocument()
  })

  it('auto-transforms input to uppercase', async () => {
    renderLanding()
    const input = screen.getByPlaceholderText(/e\.g\. AA/i) as HTMLInputElement
    await userEvent.type(input, 'aa')
    expect(input.value).toBe('AA')
  })

  it('shows validation error on empty submit', async () => {
    renderLanding()
    fireEvent.click(screen.getByRole('button', { name: /get product details/i }))
    expect(await screen.findByText(/please enter the batch code/i)).toBeInTheDocument()
  })

  it('shows validation error for non-alphanumeric input', async () => {
    renderLanding()
    const input = screen.getByPlaceholderText(/e\.g\. AA/i)
    await userEvent.type(input, 'A!')
    fireEvent.click(screen.getByRole('button', { name: /get product details/i }))
    expect(await screen.findByText(/alphanumeric/i)).toBeInTheDocument()
  })

  it('navigates to product page on valid submit', async () => {
    renderLanding()
    const input = screen.getByPlaceholderText(/e\.g\. AA/i)
    await userEvent.type(input, 'aa')
    fireEvent.click(screen.getByRole('button', { name: /get product details/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/product/AA')
  })
})
