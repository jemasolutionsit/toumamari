import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, LogOut, RefreshCw, Check, X, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import {
  adminFetchAllTours,
  adminUpdateTour,
  adminCreateTour,
  adminUpdateTourFull,
  adminDeleteTour,
  adminFetchAllBookings,
  adminUpdateBookingStatus,
  adminFetchAllMessages,
  adminMarkMessageRead,
  adminFetchDiscountCodes,
  adminCreateDiscountCode,
  adminUpdateDiscountCode,
  adminDeleteDiscountCode,
} from "../lib/api";
import type { DiscountCode } from "../lib/api";
import type { DbTour, DbBooking, DbContactMessage } from "../lib/database.types";

const PASSWORD = "toumamari2024";

// ── helpers ────────────────────────────────────────────────────────────────

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {children}
    </span>
  );
}

function categoryBadge(cat: string) {
  const map: Record<string, string> = {
    half_day: "bg-blue-100 text-blue-700",
    full_day: "bg-green-100 text-green-700",
    pack: "bg-purple-100 text-purple-700",
  };
  const label: Record<string, string> = {
    half_day: "Half Day",
    full_day: "Full Day",
    pack: "Pack",
  };
  return <Badge color={map[cat] ?? "bg-gray-100 text-gray-600"}>{label[cat] ?? cat}</Badge>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-gray-100 text-gray-600",
  };
  return <Badge color={map[status] ?? "bg-gray-100 text-gray-600"}>{status}</Badge>;
}

// ── Inline editable number cell ────────────────────────────────────────────

function EditableNumber({
  value,
  onSave,
  prefix,
  nullable,
}: {
  value: number | null;
  onSave: (v: number | null) => Promise<void>;
  prefix?: string;
  nullable?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value == null ? "" : String(value));
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    const parsed = draft === "" ? null : Number(draft);
    if (!nullable && parsed === null) { setEditing(false); setDraft(value == null ? "" : String(value)); return; }
    if (parsed !== null && isNaN(parsed)) { setEditing(false); setDraft(value == null ? "" : String(value)); return; }
    setSaving(true);
    try { await onSave(parsed); } finally { setSaving(false); setEditing(false); }
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        {prefix && <span className="text-gray-400 text-xs">{prefix}</span>}
        <input
          autoFocus
          type="number"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(value == null ? "" : String(value)); } }}
          onBlur={commit}
          disabled={saving}
          className="w-20 border border-yellow-400 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
        />
      </span>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value == null ? "" : String(value)); setEditing(true); }}
      className="text-sm hover:bg-yellow-50 hover:text-yellow-700 rounded px-1 py-0.5 transition-colors cursor-pointer"
      title="Click to edit"
    >
      {value == null ? <span className="text-gray-400 italic">—</span> : <>{prefix}{value}</>}
    </button>
  );
}

// ── Tour form (drawer) ─────────────────────────────────────────────────────

type TourFormData = Omit<DbTour, 'id' | 'created_at' | 'updated_at'>;

const EMPTY_TOUR: TourFormData = {
  slug: "",
  title_es: "",
  title_en: "",
  description_es: "",
  description_en: "",
  experience_es: "",
  experience_en: "",
  price_usd: 0,
  price_clp: 0,
  duration: "",
  category: "full_day",
  min_passengers: 1,
  image_url: "",
  includes_es: [],
  includes_en: [],
  not_includes_es: [],
  not_includes_en: [],
  itinerary_es: [],
  itinerary_en: [],
  location: null,
  active: true,
  sort_order: 0,
  offer_discount: null,
};

function touraFormFromDb(t: DbTour): TourFormData {
  return {
    slug: t.slug,
    title_es: t.title_es,
    title_en: t.title_en,
    description_es: t.description_es ?? "",
    description_en: t.description_en ?? "",
    experience_es: t.experience_es ?? "",
    experience_en: t.experience_en ?? "",
    price_usd: t.price_usd,
    price_clp: t.price_clp,
    duration: t.duration ?? "",
    category: t.category,
    min_passengers: t.min_passengers,
    image_url: t.image_url ?? "",
    includes_es: t.includes_es,
    includes_en: t.includes_en,
    not_includes_es: t.not_includes_es,
    not_includes_en: t.not_includes_en,
    itinerary_es: t.itinerary_es,
    itinerary_en: t.itinerary_en,
    location: t.location,
    active: t.active,
    sort_order: t.sort_order,
    offer_discount: t.offer_discount,
  };
}

function TourDrawer({
  initial,
  onClose,
  onSaved,
}: {
  initial: { mode: "create" } | { mode: "edit"; tour: DbTour };
  onClose: () => void;
  onSaved: (tour: DbTour) => void;
}) {
  const isEdit = initial.mode === "edit";
  const [form, setForm] = useState<TourFormData>(
    initial.mode === "edit" ? touraFormFromDb(initial.tour) : { ...EMPTY_TOUR }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // helper to set a field
  function set<K extends keyof TourFormData>(key: K, value: TourFormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload: TourFormData = {
        ...form,
        // coerce strings to arrays/objects where needed
        includes_es: typeof form.includes_es === "string"
          ? (form.includes_es as string).split("\n").map(s => s.trim()).filter(Boolean)
          : form.includes_es,
        includes_en: typeof form.includes_en === "string"
          ? (form.includes_en as string).split("\n").map(s => s.trim()).filter(Boolean)
          : form.includes_en,
        not_includes_es: typeof form.not_includes_es === "string"
          ? (form.not_includes_es as string).split("\n").map(s => s.trim()).filter(Boolean)
          : form.not_includes_es,
        not_includes_en: typeof form.not_includes_en === "string"
          ? (form.not_includes_en as string).split("\n").map(s => s.trim()).filter(Boolean)
          : form.not_includes_en,
        offer_discount: form.offer_discount === null || form.offer_discount === undefined ? null : Number(form.offer_discount),
        price_usd: Number(form.price_usd),
        price_clp: Number(form.price_clp),
        sort_order: Number(form.sort_order),
        min_passengers: Number(form.min_passengers),
      };

      if (initial.mode === "edit") {
        await adminUpdateTourFull(initial.tour.id, payload);
        onSaved({ ...initial.tour, ...payload });
      } else {
        const created = await adminCreateTour(payload);
        onSaved(created);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving tour");
    } finally {
      setSaving(false);
    }
  };

  // For arrays displayed as textarea, join with newline
  const arrayToText = (arr: string[] | { time: string; title: string; desc: string }[]) => {
    if (!arr || arr.length === 0) return "";
    if (typeof arr[0] === "string") return (arr as string[]).join("\n");
    return (arr as { time: string; title: string; desc: string }[])
      .map(it => `${it.time} | ${it.title} | ${it.desc}`)
      .join("\n");
  };

  // fi is only used with string-valued keys of TourFormData
  const fi = (key: keyof TourFormData) => ({
    value: (form[key] as string | null | undefined) ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />
      {/* Drawer */}
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Editar Tour" : "Nuevo Tour"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 px-6 py-4 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Basic info */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Info general</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Slug *</span>
                <input required className="field" {...fi("slug")} placeholder="tour-nombre-slug" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Título ES *</span>
                <input required className="field" {...fi("title_es")} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Título EN *</span>
                <input required className="field" {...fi("title_en")} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Categoría</span>
                <select className="field" value={form.category} onChange={e => set("category", e.target.value as DbTour["category"])}>
                  <option value="half_day">Half Day</option>
                  <option value="full_day">Full Day</option>
                  <option value="pack">Pack</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Duración</span>
                <input className="field" {...fi("duration")} placeholder="8 horas" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Precio USD *</span>
                <input required type="number" min="0" className="field" value={form.price_usd} onChange={e => set("price_usd", Number(e.target.value))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Precio CLP *</span>
                <input required type="number" min="0" className="field" value={form.price_clp} onChange={e => set("price_clp", Number(e.target.value))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Descuento % (opcional)</span>
                <input type="number" min="0" max="100" className="field" value={form.offer_discount ?? ""} onChange={e => set("offer_discount", e.target.value === "" ? null : Number(e.target.value))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Min. pasajeros</span>
                <input type="number" min="1" className="field" value={form.min_passengers} onChange={e => set("min_passengers", Number(e.target.value))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Sort order</span>
                <input type="number" className="field" value={form.sort_order} onChange={e => set("sort_order", Number(e.target.value))} />
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Image URL</span>
                <input className="field" {...fi("image_url")} placeholder="/images/tours/..." />
              </label>
              <label className="flex items-center gap-2 text-sm col-span-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => set("active", e.target.checked)} className="w-4 h-4 accent-yellow-400" />
                <span className="font-medium text-gray-700">Activo</span>
              </label>
            </div>
          </section>

          {/* Descriptions */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Descripciones</h3>
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Descripción ES</span>
                <textarea rows={3} className="field" value={form.description_es ?? ""} onChange={e => set("description_es", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Descripción EN</span>
                <textarea rows={3} className="field" value={form.description_en ?? ""} onChange={e => set("description_en", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Experiencia ES</span>
                <textarea rows={3} className="field" value={form.experience_es ?? ""} onChange={e => set("experience_es", e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Experiencia EN</span>
                <textarea rows={3} className="field" value={form.experience_en ?? ""} onChange={e => set("experience_en", e.target.value)} />
              </label>
            </div>
          </section>

          {/* Includes */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Incluye / No incluye (una por línea)</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Incluye ES</span>
                <textarea rows={4} className="field" value={arrayToText(form.includes_es)} onChange={e => set("includes_es", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Incluye EN</span>
                <textarea rows={4} className="field" value={arrayToText(form.includes_en)} onChange={e => set("includes_en", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">No incluye ES</span>
                <textarea rows={3} className="field" value={arrayToText(form.not_includes_es)} onChange={e => set("not_includes_es", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">No incluye EN</span>
                <textarea rows={3} className="field" value={arrayToText(form.not_includes_en)} onChange={e => set("not_includes_en", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} />
              </label>
            </div>
          </section>

          {/* Itinerary */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Itinerario (formato: HH:MM | Título | Descripción, una por línea)</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Itinerario ES</span>
                <textarea rows={4} className="field font-mono text-xs" value={arrayToText(form.itinerary_es)} onChange={e => {
                  const lines = e.target.value.split("\n").filter(Boolean);
                  set("itinerary_es", lines.map(l => {
                    const [time = "", title = "", desc = ""] = l.split("|").map(s => s.trim());
                    return { time, title, desc };
                  }));
                }} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">Itinerario EN</span>
                <textarea rows={4} className="field font-mono text-xs" value={arrayToText(form.itinerary_en)} onChange={e => {
                  const lines = e.target.value.split("\n").filter(Boolean);
                  set("itinerary_en", lines.map(l => {
                    const [time = "", title = "", desc = ""] = l.split("|").map(s => s.trim());
                    return { time, title, desc };
                  }));
                }} />
              </label>
            </div>
          </section>

          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm rounded-lg bg-yellow-400 hover:bg-yellow-500 font-semibold text-black disabled:opacity-50 transition-colors">
              {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear tour"}
            </button>
          </div>
        </form>
      </div>

      <style>{`.field { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.375rem 0.625rem; font-size: 0.875rem; width: 100%; outline: none; transition: border-color 0.15s; } .field:focus { border-color: #facc15; box-shadow: 0 0 0 2px #fef08a; }`}</style>
    </div>
  );
}

// ── Tours tab ──────────────────────────────────────────────────────────────

function ToursTab() {
  const [tours, setTours] = useState<DbTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<{ mode: "create" } | { mode: "edit"; tour: DbTour } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setTours(await adminFetchAllTours()); }
    catch (e) { setError(e instanceof Error ? e.message : "Error loading tours"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, update: Parameters<typeof adminUpdateTour>[1]) => {
    await adminUpdateTour(id, update);
    setTours(prev => prev.map(t => t.id === id ? { ...t, ...update } : t));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este tour? Esta acción no se puede deshacer.")) return;
    setDeleting(id);
    try {
      await adminDeleteTour(id);
      setTours(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = (tour: DbTour) => {
    setTours(prev => {
      const idx = prev.findIndex(t => t.id === tour.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = tour;
        return next;
      }
      return [tour, ...prev];
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading tours...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      {drawer && (
        <TourDrawer
          initial={drawer}
          onClose={() => setDrawer(null)}
          onSaved={handleSaved}
        />
      )}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">{tours.length} tours</span>
        <button
          onClick={() => setDrawer({ mode: "create" })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tour
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">Title (ES)</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price USD</th>
              <th className="px-4 py-3">Price CLP</th>
              <th className="px-4 py-3">Discount %</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tours.map(tour => (
              <tr key={tour.id} className={`hover:bg-gray-50 transition-colors ${!tour.active ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate" title={tour.title_es}>
                  {tour.title_es}
                </td>
                <td className="px-4 py-3">{categoryBadge(tour.category)}</td>
                <td className="px-4 py-3">
                  <EditableNumber
                    value={tour.price_usd}
                    prefix="$"
                    onSave={v => patch(tour.id, { price_usd: v ?? tour.price_usd })}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableNumber
                    value={tour.price_clp}
                    onSave={v => patch(tour.id, { price_clp: v ?? tour.price_clp })}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableNumber
                    value={tour.offer_discount}
                    nullable
                    prefix="%"
                    onSave={v => patch(tour.id, { offer_discount: v })}
                  />
                </td>
                <td className="px-4 py-3">
                  <EditableNumber
                    value={tour.sort_order}
                    onSave={v => patch(tour.id, { sort_order: v ?? tour.sort_order })}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => patch(tour.id, { active: !tour.active })}
                    className={`w-10 h-6 rounded-full transition-colors relative inline-block ${tour.active ? "bg-yellow-400" : "bg-gray-300"}`}
                    title={tour.active ? "Deactivate" : "Activate"}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${tour.active ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setDrawer({ mode: "edit", tour })}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-700 hover:bg-yellow-50 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tour.id)}
                      disabled={deleting === tour.id}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Bookings tab ───────────────────────────────────────────────────────────

const BOOKING_STATUSES: DbBooking["status"][] = ["pending", "confirmed", "cancelled", "refunded"];

function BookingsTab() {
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setBookings(await adminFetchAllBookings()); }
    catch (e) { setError(e instanceof Error ? e.message : "Error loading bookings"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: DbBooking["status"]) => {
    setUpdating(id);
    try {
      await adminUpdateBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } finally { setUpdating(null); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading bookings...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (bookings.length === 0) return <div className="p-8 text-center text-gray-400">No bookings yet.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Tour</th>
            <th className="px-4 py-3">Guest</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Travelers</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Total USD</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map(b => (
            <tr key={b.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 max-w-[160px] truncate font-medium text-gray-800" title={b.tour_id}>
                {b.tour_id}
              </td>
              <td className="px-4 py-3 text-gray-700">{b.guest_name ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600 text-xs">{b.guest_email ?? "—"}</td>
              <td className="px-4 py-3 text-center">{b.travelers}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.travel_date}</td>
              <td className="px-4 py-3 font-medium">${b.total_usd}</td>
              <td className="px-4 py-3">
                <div className="relative inline-block">
                  <select
                    value={b.status}
                    disabled={updating === b.id}
                    onChange={e => changeStatus(b.id!, e.target.value as DbBooking["status"])}
                    className="appearance-none pr-6 pl-2 py-1 rounded border border-gray-200 text-xs bg-white focus:outline-none focus:border-yellow-400 cursor-pointer disabled:opacity-50"
                  >
                    {BOOKING_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                {b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Messages tab ───────────────────────────────────────────────────────────

function MessagesTab() {
  const [messages, setMessages] = useState<DbContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setMessages(await adminFetchAllMessages()); }
    catch (e) { setError(e instanceof Error ? e.message : "Error loading messages"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRead = async (id: string, current: boolean) => {
    setUpdating(id);
    try {
      await adminMarkMessageRead(id, !current);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !current } : m));
    } finally { setUpdating(null); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading messages...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (messages.length === 0) return <div className="p-8 text-center text-gray-400">No messages yet.</div>;

  return (
    <div className="divide-y divide-gray-100">
      {messages.map(m => (
        <div
          key={m.id}
          className={`p-4 hover:bg-gray-50 transition-colors ${!m.read ? "border-l-4 border-yellow-400 bg-yellow-50/30" : ""}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-800">{m.name}</span>
                <span className="text-gray-400 text-xs">{m.email}</span>
                {m.subject && (
                  <Badge color="bg-gray-100 text-gray-600">{m.subject}</Badge>
                )}
                {!m.read && <Badge color="bg-yellow-100 text-yellow-700">New</Badge>}
              </div>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap break-words">{m.message}</p>
              <p className="mt-1 text-xs text-gray-400">
                {m.created_at ? new Date(m.created_at).toLocaleString() : ""}
              </p>
            </div>
            <button
              onClick={() => toggleRead(m.id!, !!m.read)}
              disabled={updating === m.id}
              title={m.read ? "Mark as unread" : "Mark as read"}
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-colors disabled:opacity-50 ${
                m.read
                  ? "border-gray-200 text-gray-400 hover:border-gray-400"
                  : "border-yellow-400 text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
              }`}
            >
              {m.read ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Cupones tab ────────────────────────────────────────────────────────────

const MIGRATION_SQL = `CREATE TABLE discount_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_percent int NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  max_uses int,
  uses_count int DEFAULT 0,
  expires_at timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);`;

function CuponesTab() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSql, setShowSql] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", discount_percent: 10, max_uses: "", expires_at: "", active: true });
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setCodes(await adminFetchDiscountCodes()); }
    catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      if (msg.includes("does not exist") || msg.includes("relation") || msg.includes("42P01")) {
        setError("MIGRATION_NEEDED");
      } else {
        setError(msg);
      }
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminCreateDiscountCode({
        code: form.code.toUpperCase().trim(),
        discount_percent: Number(form.discount_percent),
        max_uses: form.max_uses === "" ? null : Number(form.max_uses),
        expires_at: form.expires_at === "" ? null : form.expires_at,
        active: form.active,
      });
      setForm({ code: "", discount_percent: 10, max_uses: "", expires_at: "", active: true });
      setShowForm(false);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al crear");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    setUpdating(id);
    try {
      await adminUpdateDiscountCode(id, { active: !active });
      setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
    } finally { setUpdating(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    setUpdating(id);
    try {
      await adminDeleteDiscountCode(id);
      setCodes(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally { setUpdating(null); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando cupones...</div>;

  const needsMigration = error === "MIGRATION_NEEDED";

  return (
    <div className="p-4 space-y-4">
      {/* Migration notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {needsMigration ? "Ejecutar migración SQL para activar cupones" : "SQL de migración disponible"}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Ejecuta este SQL en el editor de Supabase (Dashboard &gt; SQL Editor) antes de usar esta sección.
            </p>
          </div>
          <button
            onClick={() => setShowSql(s => !s)}
            className="text-xs underline text-amber-700 whitespace-nowrap"
          >
            {showSql ? "Ocultar SQL" : "Ver SQL"}
          </button>
        </div>
        {showSql && (
          <pre className="mt-3 bg-amber-100 rounded-lg p-3 text-xs text-amber-900 overflow-x-auto whitespace-pre-wrap">
            {MIGRATION_SQL}
          </pre>
        )}
      </div>

      {!needsMigration && error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {!needsMigration && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{codes.length} cupones</span>
            <button
              onClick={() => setShowForm(s => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo cupón
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Nuevo cupón</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-gray-600">Código *</span>
                  <input
                    required
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400 uppercase"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="EASTER20"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-gray-600">Descuento % *</span>
                  <input
                    required type="number" min="1" max="100"
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400"
                    value={form.discount_percent}
                    onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-gray-600">Max. usos (opcional)</span>
                  <input
                    type="number" min="1"
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400"
                    value={form.max_uses}
                    onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                    placeholder="Sin límite"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-medium text-gray-600">Expira (opcional)</span>
                  <input
                    type="date"
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-400"
                    value={form.expires_at}
                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm col-span-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-yellow-400" />
                  <span className="font-medium text-gray-600 text-xs">Activo</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-4 py-1.5 text-xs rounded-lg bg-yellow-400 hover:bg-yellow-500 font-semibold text-black disabled:opacity-50">
                  {saving ? "Guardando..." : "Crear"}
                </button>
              </div>
            </form>
          )}

          {/* Codes list */}
          {codes.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">Sin cupones. Crea el primero.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Descuento</th>
                    <th className="px-4 py-3">Usos</th>
                    <th className="px-4 py-3">Expira</th>
                    <th className="px-4 py-3 text-center">Activo</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {codes.map(c => (
                    <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${!c.active ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">{c.code}</td>
                      <td className="px-4 py-3">
                        <Badge color="bg-green-100 text-green-700">{c.discount_percent}%</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.uses_count}{c.max_uses != null ? ` / ${c.max_uses}` : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : <span className="text-gray-300">Sin límite</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(c.id, c.active)}
                          disabled={updating === c.id}
                          className={`w-10 h-6 rounded-full transition-colors relative inline-block disabled:opacity-50 ${c.active ? "bg-yellow-400" : "bg-gray-300"}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${c.active ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={updating === c.id}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Reports tab ────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ReportesTab() {
  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setBookings(await adminFetchAllBookings()); }
    catch (e) { setError(e instanceof Error ? e.message : "Error loading bookings"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando reportes...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // ── compute stats ──
  const activeBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const totalCount = activeBookings.length;
  const totalUSD = activeBookings.reduce((s, b) => s + (b.total_usd ?? 0), 0);
  const totalCLP = activeBookings.reduce((s, b) => s + (b.total_clp ?? 0), 0);
  const avgUSD = totalCount > 0 ? totalUSD / totalCount : 0;

  const statuses: DbBooking["status"][] = ["pending", "confirmed", "cancelled", "refunded"];
  const byStatus = statuses.map(st => {
    const rows = bookings.filter(b => b.status === st);
    return {
      status: st,
      count: rows.length,
      usd: rows.reduce((s, b) => s + (b.total_usd ?? 0), 0),
    };
  });

  const recent = [...bookings].slice(0, 10);

  // monthly breakdown — last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("es-CL", { month: "short", year: "2-digit" }),
    };
  });

  const monthlyData = months.map(m => {
    const rows = activeBookings.filter(b => {
      const d = b.created_at ?? "";
      return d.startsWith(m.key);
    });
    return {
      ...m,
      count: rows.length,
      usd: rows.reduce((s, b) => s + (b.total_usd ?? 0), 0),
    };
  });

  const statusColor: Record<string, string> = {
    pending: "text-yellow-700",
    confirmed: "text-green-700",
    cancelled: "text-red-600",
    refunded: "text-gray-500",
  };

  return (
    <div className="p-4 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total reservas", value: String(totalCount) },
          { label: "Revenue USD", value: `$${fmt(totalUSD)}` },
          { label: "Revenue CLP", value: `$${Math.round(totalCLP).toLocaleString("es-CL")}` },
          { label: "Promedio USD", value: `$${fmt(avgUSD)}` },
        ].map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By status */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Por estado</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-right">Reservas</th>
                <th className="px-4 py-2 text-right">Revenue USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byStatus.map(row => (
                <tr key={row.status} className="hover:bg-gray-50">
                  <td className={`px-4 py-2 font-medium capitalize ${statusColor[row.status] ?? "text-gray-700"}`}>
                    {row.status}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.count}</td>
                  <td className="px-4 py-2 text-right text-gray-700">${fmt(row.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Monthly breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Últimos 6 meses</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-2 text-left">Mes</th>
                <th className="px-4 py-2 text-right">Reservas</th>
                <th className="px-4 py-2 text-right">Revenue USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyData.map(row => (
                <tr key={row.key} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-700 capitalize">{row.label}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{row.count}</td>
                  <td className="px-4 py-2 text-right text-gray-700">${fmt(row.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Actividad reciente (últimas 10 reservas)</h3>
        </div>
        {recent.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Sin reservas aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Tour</th>
                <th className="px-4 py-2 text-left">Guest</th>
                <th className="px-4 py-2 text-right">USD</th>
                <th className="px-4 py-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500 text-xs whitespace-nowrap">
                    {b.created_at ? new Date(b.created_at).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800 max-w-[160px] truncate">{b.tour_id}</td>
                  <td className="px-4 py-2 text-gray-600">{b.guest_name ?? "—"}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-700">${fmt(b.total_usd ?? 0)}</td>
                  <td className="px-4 py-2 text-center">{statusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Login gate ─────────────────────────────────────────────────────────────

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === PASSWORD) { onAuth(); }
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-xl font-bold text-black">T</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Toumamari Back-office</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pw}
                onChange={e => setPw(e.target.value)}
                autoFocus
                className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  error ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-yellow-300 focus:border-yellow-400"
                }`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">Incorrect password</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main admin panel ───────────────────────────────────────────────────────

type Tab = "tours" | "bookings" | "messages" | "cupones" | "reportes";

export function Admin() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("tours");
  const [refreshKey, setRefreshKey] = useState(0);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const tabs: { id: Tab; label: string }[] = [
    { id: "tours", label: "Tours" },
    { id: "bookings", label: "Bookings" },
    { id: "messages", label: "Messages" },
    { id: "cupones", label: "Cupones" },
    { id: "reportes", label: "Reportes" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-black">T</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">Toumamari Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-yellow-400 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {tab === "tours" && <ToursTab key={`tours-${refreshKey}`} />}
          {tab === "bookings" && <BookingsTab key={`bookings-${refreshKey}`} />}
          {tab === "messages" && <MessagesTab key={`messages-${refreshKey}`} />}
          {tab === "cupones" && <CuponesTab key={`cupones-${refreshKey}`} />}
          {tab === "reportes" && <ReportesTab key={`reportes-${refreshKey}`} />}
        </div>
      </main>
    </div>
  );
}
