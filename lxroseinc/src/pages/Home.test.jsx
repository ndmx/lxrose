// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import Header from './Header';
import { submitPublicForm } from '../firebase';
vi.mock('../firebase', () => ({ submitPublicForm: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('public request experience', () => {
  it('preserves a failed submission and only clears after successful retry', async () => {
    submitPublicForm.mockRejectedValueOnce(new Error('Denied')).mockResolvedValueOnce('saved-id');
    const user=userEvent.setup();render(<MemoryRouter><Home /></MemoryRouter>);
    await user.type(screen.getByLabelText('Full name'),'Example Person');
    await user.type(screen.getByLabelText('Email address'),'person@example.test');
    await user.type(screen.getByLabelText('How can we help?'),'Please tell me about nursing care.');
    await user.click(screen.getByRole('button',{name:/Send your message/}));
    expect((await screen.findByRole('alert')).textContent).toContain('could not be sent');
    expect(screen.getByLabelText('Full name').value).toBe('Example Person');
    expect(screen.queryByRole('status')).toBeNull();
    await user.click(screen.getByRole('button',{name:/Send your message/}));
    expect((await screen.findByRole('status')).textContent).toContain('received');
    expect(screen.getByLabelText('Full name').value).toBe('');
    expect(submitPublicForm).toHaveBeenLastCalledWith('contactForms',{name:'Example Person',email:'person@example.test',message:'Please tell me about nursing care.'});
  });
  it('prevents duplicate requests while persistence is pending', async () => {
    let resolve;submitPublicForm.mockImplementationOnce(() => new Promise(done => {resolve=done;}));
    const user=userEvent.setup();render(<MemoryRouter><Home /></MemoryRouter>);
    await user.type(screen.getByLabelText('Full name'),'Example');
    await user.type(screen.getByLabelText('Email address'),'a@example.test');
    await user.type(screen.getByLabelText('How can we help?'),'Hello');
    await user.click(screen.getByRole('button',{name:/Send your message/}));
    expect(screen.getByRole('button',{name:/Sending/}).disabled).toBe(true);
    expect(screen.getByLabelText('Full name').disabled).toBe(true);
    resolve('saved');await screen.findByRole('status');expect(submitPublicForm).toHaveBeenCalledTimes(1);
  });
  it('opens the menu by keyboard and restores focus on Escape', async () => {
    window.scrollTo=vi.fn();const user=userEvent.setup();render(<MemoryRouter><Header /></MemoryRouter>);
    const menu=screen.getByRole('button',{name:/Menu/});menu.focus();await user.keyboard('{Enter}');
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    screen.getByRole('link',{name:'Our services'}).focus();await user.keyboard('{Escape}');
    await waitFor(()=>expect(menu.getAttribute('aria-expanded')).toBe('false'));
    expect(document.activeElement).toBe(menu);
  });
});
