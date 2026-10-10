// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import Header from './Header';
import Home from './Home';
import Services from './Services';
import About from './About';
import MentalServices from './MentalServices';
import FAQ from '../components/FAQ';
import RouteScroll from '../components/RouteScroll';
vi.mock('../firebase', () => ({ submitPublicForm: vi.fn() }));
beforeEach(() => { window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function HistoryButtons() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate(-1)}>Back</button><button onClick={() => navigate(1)}>Forward</button></>;
}
function Site({ initialEntries = ['/'] }) {
  return <MemoryRouter initialEntries={initialEntries}>
    <RouteScroll /><Header /><HistoryButtons />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/mentalservices" element={<MentalServices />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  </MemoryRouter>;
}
describe('public navigation', () => {
  it('uses page destinations consistently and closes the mobile menu after selection', async () => {
    const user = userEvent.setup(); render(<Site />);
    const nav = within(screen.getByRole('navigation', { name: 'Main navigation' }));
    expect(nav.getAllByRole('link').map(link => link.getAttribute('href'))).toEqual(['/services', '/about', '/faq', '/contact']);
    expect(screen.getByRole('link', { name: /Explore our services/ }).getAttribute('href')).toBe('/services');
    await user.click(screen.getByRole('button', { name: /Menu/ }));
    await user.click(nav.getByRole('link', { name: 'Our services' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Care for the way you live.');
    expect(nav.getByRole('link', { name: 'Our services' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: /Menu/ }).getAttribute('aria-expanded')).toBe('false');
    await user.click(nav.getByRole('link', { name: 'About LxRose' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Care that connects people.');
    expect(nav.getByRole('link', { name: 'About LxRose' }).getAttribute('aria-current')).toBe('page');
    expect(nav.getByRole('link', { name: 'Our services' }).hasAttribute('aria-current')).toBe(false);
  });
  it('keeps the service section active on direct detail URLs with a working overview link', async () => {
    const user = userEvent.setup(); render(<Site initialEntries={['/mentalservices']} />);
    expect(screen.getByRole('link', { name: 'Our services' }).getAttribute('aria-current')).toBe('true');
    await user.click(screen.getByRole('link', { name: /All services/ }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Care for the way you live.');
  });
  it('starts new pages at the top and restores scroll for Back and Forward entries', async () => {
    const user = userEvent.setup(); render(<Site />);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(700);
    fireEvent.scroll(window);
    await user.click(screen.getByRole('link', { name: 'About LxRose' }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300);
    fireEvent.scroll(window);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 700, behavior: 'instant' });
    await user.click(screen.getByRole('button', { name: 'Forward' }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 300, behavior: 'instant' });
  });
});
