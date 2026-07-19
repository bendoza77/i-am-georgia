import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ImagePlus, Trash2, Star, Check, X } from 'lucide-react';
import { useHotels } from '../../context/HotelsContext';
import { useToast } from '../../components/admin/ToastProvider';
import {
  EMPTY_HOTEL,
  HOTEL_CITIES,
  HOTEL_TYPES,
  HOTEL_STATUSES,
  AMENITIES,
} from '../../constants/hotels';
import {
  FieldLabel,
  TextInput,
  TextArea,
  SelectInput,
  Toggle,
  StarRating,
  StatusBadge,
} from '../../components/admin/ui';
import AmenityIcon from '../../components/admin/AmenityIcon';
import SmartImage from '../../components/ui/SmartImage';
import { cn } from '../../utils/cn';

function Card({ title, desc, children }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <h2 className="font-display text-lg text-ink-900">{title}</h2>
      {desc && <p className="mt-0.5 text-sm text-ink-400">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function HotelEditor() {
  const { id } = useParams();
  const { getHotel, addHotel, updateHotel, loading } = useHotels();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isNew = !id;
  const existing = useMemo(() => (id ? getHotel(id) : null), [id, getHotel]);
  const [form, setForm] = useState(() => existing ?? EMPTY_HOTEL);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // The hotel list loads asynchronously, so `existing` may be undefined on the
  // first render. Seed the form once, when it first arrives.
  const seeded = useRef(false);
  useEffect(() => {
    if (existing && !seeded.current) {
      setForm(existing);
      seeded.current = true;
    }
  }, [existing]);

  // Still fetching the hotel we're editing — don't flash "not found".
  if (id && !existing && loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
        <p className="font-display text-xl text-ink-900">Loading…</p>
      </div>
    );
  }

  // Editing an id that no longer exists
  if (id && !existing) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center">
        <p className="font-display text-xl text-ink-900">Hotel not found</p>
        <Link to="/admin/hotels" className="mt-4 font-semibold text-brand-600 hover:text-brand-700">
          ← Back to hotels
        </Link>
      </div>
    );
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setImage = (i, value) =>
    setForm((f) => ({ ...f, images: f.images.map((img, idx) => (idx === i ? value : img)) }));
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const toggleAmenity = (aid) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(aid)
        ? f.amenities.filter((x) => x !== aid)
        : [...f.amenities, aid],
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast('Please fix the highlighted fields', 'error');
      return;
    }

    // Keep the room-rate table (form.rooms) intact; only coerce scalar fields.
    const clean = {
      ...form,
      pricePerNight: Number(form.pricePerNight) || 0,
      roomsCount: Number(form.roomsCount) || 0,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      stars: Number(form.stars) || 0,
      images: form.images.filter((s) => s.trim()),
    };

    try {
      setSaving(true);
      if (isNew) {
        await addHotel(clean);
        toast(`“${clean.name}” created`, 'success');
      } else {
        await updateHotel(id, clean);
        toast('Changes saved', 'success');
      }
      navigate('/admin/hotels');
    } catch (err) {
      toast(err.message || 'Could not save the hotel', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/hotels')}
            className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 text-ink-600 transition-colors hover:bg-white"
            aria-label="Back"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h1 className="font-display text-2xl text-ink-900 sm:text-3xl">
              {isNew ? 'Add a new hotel' : form.name || 'Edit hotel'}
            </h1>
            <p className="text-sm text-ink-500">
              {isNew ? 'Create a new property from scratch.' : 'Update any detail of this property.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/hotels')}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            <X size={17} /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={18} /> {saving ? 'Saving…' : isNew ? 'Create hotel' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* ---- Left: form ---- */}
        <div className="space-y-6">
          <Card title="Basics" desc="The essentials guests see first.">
            <div className="grid gap-4">
              <div>
                <FieldLabel htmlFor="name">Hotel name</FieldLabel>
                <TextInput
                  id="name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Rooms Hotel Tbilisi"
                  className={errors.name ? 'border-red-400 focus:border-red-400' : ''}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="type">Property type</FieldLabel>
                  <SelectInput id="type" value={form.type} options={HOTEL_TYPES} onChange={(e) => set('type', e.target.value)} />
                </div>
                <div>
                  <FieldLabel htmlFor="city">City / region</FieldLabel>
                  <SelectInput id="city" value={form.city} options={HOTEL_CITIES} onChange={(e) => set('city', e.target.value)} />
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <TextInput id="address" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, district" />
              </div>

              <div>
                <FieldLabel htmlFor="tagline" hint={`${form.tagline.length}/80`}>
                  Short tagline
                </FieldLabel>
                <TextInput
                  id="tagline"
                  maxLength={80}
                  value={form.tagline}
                  onChange={(e) => set('tagline', e.target.value)}
                  placeholder="One memorable line about this stay"
                />
              </div>

              <div>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <TextArea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the atmosphere, location and what makes this hotel special…"
                />
              </div>
            </div>
          </Card>

          <Card title="Pricing & capacity">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="price">Price per night</FieldLabel>
                <div className="flex gap-2">
                  <SelectInput
                    value={form.currency}
                    options={['USD', 'EUR', 'GEL']}
                    onChange={(e) => set('currency', e.target.value)}
                    className="w-24"
                  />
                  <TextInput
                    id="price"
                    type="number"
                    min="0"
                    value={form.pricePerNight}
                    onChange={(e) => set('pricePerNight', e.target.value)}
                    className={errors.pricePerNight ? 'border-red-400 focus:border-red-400' : ''}
                  />
                </div>
                {errors.pricePerNight && <p className="mt-1 text-xs text-red-600">{errors.pricePerNight}</p>}
              </div>
              <div>
                <FieldLabel htmlFor="rooms">Number of rooms</FieldLabel>
                <TextInput id="rooms" type="number" min="0" value={form.roomsCount} onChange={(e) => set('roomsCount', e.target.value)} />
              </div>
              <div>
                <FieldLabel htmlFor="checkin">Check-in</FieldLabel>
                <TextInput id="checkin" type="time" value={form.checkIn} onChange={(e) => set('checkIn', e.target.value)} />
              </div>
              <div>
                <FieldLabel htmlFor="checkout">Check-out</FieldLabel>
                <TextInput id="checkout" type="time" value={form.checkOut} onChange={(e) => set('checkOut', e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="Ratings">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>Star classification</FieldLabel>
                <StarRating value={Number(form.stars)} onChange={(n) => set('stars', n)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="rating">Guest score</FieldLabel>
                  <TextInput id="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
                </div>
                <div>
                  <FieldLabel htmlFor="reviews">Reviews</FieldLabel>
                  <TextInput id="reviews" type="number" min="0" value={form.reviews} onChange={(e) => set('reviews', e.target.value)} />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Photos" desc="Paste image URLs — the first is used as the cover.">
            <div className="space-y-3">
              {form.images.map((img, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-ink-100 bg-sand-100">
                    {img ? (
                      <SmartImage src={img} alt="" fallbackSeed={`edit-${i}`} wrapperClassName="h-full w-full" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-ink-300">
                        <ImagePlus size={18} />
                      </span>
                    )}
                  </div>
                  <TextInput value={img} onChange={(e) => setImage(i, e.target.value)} placeholder="https://…" />
                  {i === 0 && (
                    <span className="hidden shrink-0 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-600 sm:inline">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-400 hover:bg-red-500/10 hover:text-red-600"
                    aria-label="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-600"
              >
                <ImagePlus size={17} /> Add photo
              </button>
            </div>
          </Card>

          <Card title="Amenities" desc="Tap to toggle what this property offers.">
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const active = form.amenities.includes(a.id);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAmenity(a.id)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'border-brand-500 bg-brand-500/10 text-brand-700'
                        : 'border-ink-200 text-ink-500 hover:border-ink-300',
                    )}
                  >
                    <AmenityIcon name={a.icon} size={15} />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ---- Right: preview + publish ---- */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card title="Publishing">
            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <SelectInput id="status" value={form.status} options={HOTEL_STATUSES} onChange={(e) => set('status', e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-sand-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-800">Featured</p>
                  <p className="text-xs text-ink-400">Show on the homepage</p>
                </div>
                <Toggle checked={form.featured} onChange={(v) => set('featured', v)} label="Featured" />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-sand-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-800">Available to book</p>
                  <p className="text-xs text-ink-400">Accepting reservations</p>
                </div>
                <Toggle checked={form.available} onChange={(v) => set('available', v)} label="Available" />
              </div>
            </div>
          </Card>

          {/* Live preview */}
          <div>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-ink-400">Live preview</p>
            <motion.div layout className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-soft)]">
              <div className="relative aspect-[16/10]">
                <SmartImage src={form.images[0]} alt={form.name} fallbackSeed="preview" wrapperClassName="h-full w-full" />
                <div className="absolute left-3 top-3">
                  <StatusBadge status={form.status} />
                </div>
                <div className="glass absolute bottom-3 right-3 rounded-xl px-3 py-1.5 text-right">
                  <span className="text-[0.6rem] uppercase tracking-wide text-ink-500">from</span>
                  <p className="font-display text-lg leading-none text-ink-900">
                    {form.currency === 'EUR' ? '€' : form.currency === 'GEL' ? '₾' : '$'}
                    {form.pricePerNight || 0}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-gold-500">
                  {[...Array(Number(form.stars) || 0)].map((_, i) => (
                    <Star key={i} size={13} className="fill-gold-500" />
                  ))}
                </div>
                <h3 className="mt-1.5 font-display text-xl text-ink-900">{form.name || 'Hotel name'}</h3>
                <p className="text-sm text-ink-400">
                  {form.city} · {form.type}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500">{form.tagline || form.description || 'Your tagline appears here.'}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {form.amenities.slice(0, 4).map((aid) => {
                    const a = AMENITIES.find((x) => x.id === aid);
                    if (!a) return null;
                    return (
                      <span key={aid} className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-1 text-xs text-ink-500">
                        <AmenityIcon name={a.icon} size={12} /> {a.label}
                      </span>
                    );
                  })}
                  {form.amenities.length > 4 && (
                    <span className="rounded-full bg-sand-100 px-2 py-1 text-xs text-ink-500">
                      +{form.amenities.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </form>
  );
}
