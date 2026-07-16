import { useState } from 'react';
import { RotateCcw, Building2, Globe, Bell } from 'lucide-react';
import { useHotels } from '../../context/HotelsContext';
import { useToast } from '../../components/admin/ToastProvider';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { FieldLabel, TextInput, Toggle } from '../../components/admin/ui';
import { SITE } from '../../constants/site';

function Card({ icon: Icon, title, desc, children }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600">
          <Icon size={20} />
        </span>
        <div>
          <h2 className="font-display text-lg text-ink-900">{title}</h2>
          {desc && <p className="text-sm text-ink-400">{desc}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function AdminSettings() {
  const { hotels, resetHotels } = useHotels();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [prefs, setPrefs] = useState({ emailBookings: true, weeklyReport: false, lowAvailability: true });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink-900">Settings</h1>
      <p className="mt-1 text-ink-500">Manage your workspace and demo data.</p>

      <div className="mt-7 space-y-6">
        <Card icon={Building2} title="Company profile" desc="Shown across the public site.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="cname">Company name</FieldLabel>
              <TextInput id="cname" defaultValue={SITE.name} />
            </div>
            <div>
              <FieldLabel htmlFor="cmail">Contact email</FieldLabel>
              <TextInput id="cmail" defaultValue={SITE.email} />
            </div>
            <div>
              <FieldLabel htmlFor="cphone">Phone</FieldLabel>
              <TextInput id="cphone" defaultValue={SITE.phone} />
            </div>
            <div>
              <FieldLabel htmlFor="ccur">Default currency</FieldLabel>
              <TextInput id="ccur" defaultValue="USD" />
            </div>
          </div>
          <button
            onClick={() => toast('Company profile saved', 'success')}
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Save profile
          </button>
        </Card>

        <Card icon={Bell} title="Notifications" desc="Choose what lands in your inbox.">
          <ul className="divide-y divide-ink-100">
            {[
              { key: 'emailBookings', label: 'New booking alerts', hint: 'Email me for every reservation' },
              { key: 'weeklyReport', label: 'Weekly performance report', hint: 'A Monday morning summary' },
              { key: 'lowAvailability', label: 'Low availability warnings', hint: 'When a hotel is nearly full' },
            ].map((row) => (
              <li key={row.key} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink-800">{row.label}</p>
                  <p className="text-xs text-ink-400">{row.hint}</p>
                </div>
                <Toggle
                  checked={prefs[row.key]}
                  onChange={(v) => setPrefs((p) => ({ ...p, [row.key]: v }))}
                  label={row.label}
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={Globe} title="Public site" desc="How your catalogue appears to travellers.">
          <p className="text-sm text-ink-500">
            You currently have <span className="font-semibold text-ink-800">{hotels.length} hotels</span> in the
            catalogue, {hotels.filter((h) => h.status === 'published').length} of them published and live.
          </p>
        </Card>

        <Card icon={RotateCcw} title="Demo data" desc="Restore the sample hotels to their original state.">
          <p className="text-sm text-ink-500">
            Your changes are saved locally in this browser. Resetting will discard all edits and restore the
            original sample hotels.
          </p>
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <RotateCcw size={16} /> Reset demo data
          </button>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all hotel data?"
        message="Every hotel you’ve added or edited will be replaced with the original sample set."
        confirmLabel="Reset data"
        onConfirm={() => {
          resetHotels();
          setConfirmReset(false);
          toast('Demo data restored', 'success');
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
