"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import Stars from "./Stars";

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > 200;
  const initial = (review.author || "G").trim()[0]?.toUpperCase() || "G";

  return (
    <article className="relative flex w-[82%] shrink-0 snap-start flex-col rounded-xl border border-line bg-white p-4 transition hover:shadow-card-hover md:w-auto">
      <Quote className="absolute right-4 top-4 h-6 w-6 text-brand-100" aria-hidden />
      <Stars value={review.rating} size="h-3.5 w-3.5" />
      {review.text ? (
        <p className={`mb-3 mt-2.5 text-[13px] leading-relaxed text-body ${!expanded && long ? "line-clamp-5" : ""}`}>
          „{review.text}“
        </p>
      ) : null}
      {long ? (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="link -mt-2 mb-3 self-start text-xs">
          {expanded ? "Weniger" : "Mehr lesen"}
        </button>
      ) : null}

      <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3">
        {review.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.photo}
            alt=""
            width={30}
            height={30}
            referrerPolicy="no-referrer"
            className="h-[30px] w-[30px] rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-semibold text-white">
            {initial}
          </span>
        )}
        <div className="min-w-0">
          {review.authorUrl ? (
            <a href={review.authorUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-[13px] font-semibold text-ink hover:underline">
              {review.author}
            </a>
          ) : (
            <p className="truncate text-[13px] font-semibold text-ink">{review.author}</p>
          )}
          <p className="text-[11px] text-muted">{review.relativeTime} · Google</p>
        </div>
      </div>
    </article>
  );
}

export default function ReviewsCarousel({ reviews }) {
  const list = reviews.slice(0, 3);
  return (
    <div
      className={`no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:overflow-visible md:px-0 ${
        list.length === 1 ? "md:grid-cols-1" : list.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
      }`}
    >
      {list.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}
