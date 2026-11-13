import { useEffect, useRef, useState, type FormEvent } from 'react';
import { bookableServices } from '../data/salon';
import { DEMO_ADMIN_PASSWORD, readAppointments, removeAppointment, type StoredAppointment } from '../lib/demoStore';

interface AdminPanelProps {
  onClose: () => void;
}

const SESSION_KEY = 'aura-admin-session';

const serviceLabel = (id: string) => bookableServices.find((service) => service.id === id)?.label ?? id;

const sortedAppointments = () =>
  readAppointments().sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
};

const hasSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

const setSession = (active: boolean) => {
  try {
    if (active) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sessionStorage unavailable: the session lasts until the panel closes */
  }
};

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(hasSession);
  const [appointments, setAppointments] = useState<StoredAppointment[]>(sortedAppointments);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('input, button')?.focus();
  }, [isLoggedIn]);

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password'));
    if (password !== DEMO_ADMIN_PASSWORD) {
      setError('Password errata.');
      return;
    }
    setError('');
    setSession(true);
    setAppointments(sortedAppointments());
    setIsLoggedIn(true);
  };

  const logout = () => {
    setSession(false);
    setIsLoggedIn(false);
  };

  const cancel = (appointment: StoredAppointment) => {
    if (!window.confirm(`Cancellare l'appuntamento di ${appointment.name}?`)) return;
    removeAppointment(appointment.id);
    setAppointments(sortedAppointments());
  };

  return (
    <div className="admin" onKeyDown={(event) => event.key === 'Escape' && onClose()}>
      <div ref={dialogRef} className="admin__panel" role="dialog" aria-modal="true" aria-labelledby="admin-title">
        <div className="admin__head">
          <h2 id="admin-title" className="chat__title">
            Area riservata
          </h2>
          <div style={{ display: 'flex', gap: 20 }}>
            {isLoggedIn && (
              <button type="button" className="chat__close" onClick={logout}>
                Esci
              </button>
            )}
            <button type="button" className="chat__close" onClick={onClose}>
              Chiudi
            </button>
          </div>
        </div>
        <div className="admin__body">
          {!isLoggedIn && (
            <form className="form" onSubmit={login} style={{ maxWidth: 420 }}>
              <label className="field">
                <span className="sr-only">Password</span>
                <input name="password" type="password" autoComplete="current-password" placeholder="Password" required aria-describedby="admin-hint" />
              </label>
              <p id="admin-hint" className="admin__hint">
                Versione dimostrativa: la password è <strong>{DEMO_ADMIN_PASSWORD}</strong>.
              </p>
              <button type="submit" className="button form__submit">
                Accedi
              </button>
              {error && <p className="admin__error">{error}</p>}
            </form>
          )}
          {isLoggedIn && appointments.length === 0 && (
            <p>Nessun appuntamento in agenda. Prova a prenotare dal modulo o dalla chat: comparirà qui.</p>
          )}
          {isLoggedIn && appointments.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ora</th>
                  <th>Cliente</th>
                  <th>Servizio</th>
                  <th>Telefono</th>
                  <th>
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td style={{ textTransform: 'capitalize' }}>{formatDate(appointment.date)}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.name}</td>
                    <td>{serviceLabel(appointment.service)}</td>
                    <td>{appointment.phone}</td>
                    <td>
                      <button type="button" className="chat__close" onClick={() => cancel(appointment)}>
                        Cancella
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
