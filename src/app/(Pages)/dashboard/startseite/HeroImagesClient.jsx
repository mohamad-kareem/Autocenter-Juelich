"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Eye, EyeOff, ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

function formatBytes(n) {
  if (!n) return "–";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HeroImagesClient() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bilder der Startseite</h1>
          <p className="text-sm text-muted">Hintergrundbilder und das Foto im Abschnitt „Autokauf mit gutem Gefühl“.</p>
        </div>
        <Link href="/" target="_blank" className="btn btn-secondary btn-sm">
          Startseite ansehen
        </Link>
      </div>

      <ImageSection
        slot="hero"
        title="Hintergrundbilder (großer Bereich oben)"
        hint="Die Bilder wechseln auf der Startseite alle 8 Sekunden. Querformat empfohlen."
        ordered
      />

      <ImageSection
        slot="about"
        title="Foto im Abschnitt „Autokauf mit gutem Gefühl“"
        hint="Ein Bild, möglichst im Querformat (4:3). Ohne eigenes Bild wird das mitgelieferte Showroom-Foto gezeigt."
      />
    </div>
  );
}

function ImageSection({ slot, title, hint, ordered = false }) {
  const [images, setImages] = useState([]);
  const [max, setMax] = useState(ordered ? 6 : 1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/hero-images?slot=${slot}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Bilder konnten nicht geladen werden.");
        return;
      }
      setError("");
      setImages(data.images || []);
      setMax(data.max || 1);
    } catch {
      setError("Keine Verbindung zum Server.");
    } finally {
      setLoading(false);
    }
  }, [slot]);

  useEffect(() => {
    load();
  }, [load]);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setUploading(true);
    setError("");
    let added = 0;
    for (const file of files) {
      if (images.length + added >= max) {
        setError(
          max === 1
            ? "Es ist bereits ein Bild hinterlegt. Bitte zuerst das vorhandene löschen."
            : `Maximal ${max} Bilder. Bitte zuerst ein Bild löschen.`,
        );
        break;
      }
      const body = new FormData();
      body.append("file", file);
      body.append("slot", slot);
      try {
        const res = await fetch("/api/hero-images", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Upload fehlgeschlagen.");
          break;
        }
        added += 1;
      } catch {
        setError("Keine Verbindung zum Server.");
        break;
      }
    }
    setUploading(false);
    load();
  }

  async function patch(id, payload, { reload = true } = {}) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/hero-images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Änderung fehlgeschlagen.");
        return false;
      }
      if (reload) setImages((list) => list.map((img) => (img._id === id ? data.image : img)));
      return true;
    } catch {
      setError("Keine Verbindung zum Server.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!window.confirm("Dieses Bild wirklich löschen?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/hero-images/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Löschen fehlgeschlagen.");
        return;
      }
      setImages((list) => list.filter((img) => img._id !== id));
    } catch {
      setError("Keine Verbindung zum Server.");
    } finally {
      setBusyId(null);
    }
  }

  /** Put the picture at the chosen place and renumber the rest. */
  async function moveTo(id, targetIndex) {
    const from = images.findIndex((i) => i._id === id);
    if (from < 0 || from === targetIndex) return;

    const list = [...images];
    const [moved] = list.splice(from, 1);
    list.splice(targetIndex, 0, moved);
    setImages(list);

    setBusyId(id);
    await Promise.all(
      list.map((img, index) => (img.sort === index ? null : patch(img._id, { sort: index }, { reload: false }))),
    );
    setBusyId(null);
    load();
  }

  const full = images.length >= max;

  return (
    <section>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-0.5 text-[13px] text-muted">{hint}</p>

      {error ? (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {/* Upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!full) uploadFiles(e.dataTransfer.files);
        }}
        className={cx(
          "mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition",
          dragOver ? "border-brand-500 bg-brand-50" : "border-line-strong bg-white",
          full && "opacity-60",
        )}
      >
        <p className="flex items-center gap-2.5 text-[13px] text-muted">
          <UploadCloud className="h-5 w-5 shrink-0 text-brand-600" />
          <span>
            <span className="block font-medium text-ink">Bild hierher ziehen oder auswählen</span>
            JPG, PNG, WebP oder AVIF · max. 12 MB · {images.length} von {max} belegt
          </span>
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || full}
          className="btn btn-primary btn-sm"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Wird hochgeladen …" : "Bild auswählen"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={max > 1}
          className="hidden"
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* List */}
      <div className="mt-3">
        {loading ? (
          <div className="card flex items-center justify-center gap-2 p-8 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Bilder werden geladen …
          </div>
        ) : !images.length ? (
          <div className="card p-8 text-center text-[13px] text-muted">
            Noch kein eigenes Bild – es wird das mitgelieferte Foto angezeigt.
          </div>
        ) : (
          <ul className={cx("grid gap-3", max > 1 ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:max-w-md")}>
            {images.map((img, i) => (
              <li key={img._id} className={cx("card overflow-hidden", !img.active && "opacity-70")}>
                <div className="relative aspect-[16/9] bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                  {ordered ? (
                    <span className="chip absolute left-2 top-2 bg-navy-950/70 text-white">{i + 1}. Bild</span>
                  ) : null}
                  {!img.active ? (
                    <span className="chip absolute right-2 top-2 bg-slate-900/80 text-white">Ausgeblendet</span>
                  ) : null}
                </div>

                <div className="space-y-2.5 p-3">
                  <p className="truncate text-xs text-muted" title={img.fileName}>
                    {img.fileName || "Bild"} · {formatBytes(img.bytes)}
                    {img.width ? ` · ${img.width}×${img.height}` : ""}
                  </p>

                  <div>
                    <label className="label" htmlFor={`alt-${img._id}`}>
                      Bildbeschreibung (Alt-Text)
                    </label>
                    <input
                      id={`alt-${img._id}`}
                      defaultValue={img.alt}
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value !== img.alt) patch(img._id, { alt: value });
                      }}
                      className="field h-8 text-[13px]"
                      placeholder="z. B. Showroom mit Gebrauchtwagen"
                    />
                  </div>

                  {ordered && images.length > 1 ? (
                    <div>
                      <label className="label" htmlFor={`pos-${img._id}`}>
                        Reihenfolge
                      </label>
                      <select
                        id={`pos-${img._id}`}
                        value={i}
                        onChange={(e) => moveTo(img._id, Number(e.target.value))}
                        disabled={busyId === img._id}
                        className="field h-8 text-[13px]"
                      >
                        {images.map((_, index) => (
                          <option key={index} value={index}>
                            {index + 1}. Bild {index === 0 ? "(wird zuerst gezeigt)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 border-t border-line pt-2.5">
                    <button
                      type="button"
                      onClick={() => patch(img._id, { active: !img.active })}
                      disabled={busyId === img._id}
                      className="btn btn-secondary btn-sm"
                    >
                      {img.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {img.active ? "Ausblenden" : "Einblenden"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(img._id)}
                      disabled={busyId === img._id}
                      className="btn btn-sm ml-auto border border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      {busyId === img._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Löschen
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
