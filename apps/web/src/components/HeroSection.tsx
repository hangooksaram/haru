import { HERO_TITLE } from "@/lib/styles";

// 데스크톱(sm 이상)은 DesktopHeroVideo가 대체하므로 이 컴포넌트는 모바일에서만 렌더링된다.
export function HeroSection() {
  return (
    // radial 그라데이션 모양(크기·중심)은 디자인 시스템 허용 예외(3)다.
    <section className="from-brand-soft relative grid bg-radial-[70%_70%_at_75%_55%] to-transparent to-70% items-center gap-6 py-6 pb-10">
      {/* 일러스트 애니메이션의 키프레임·반복 시간·지연 값은 디자인 시스템 허용 예외(3)다.
          지연은 클래스로 주므로 animation 축약형 대신 개별 속성을 써서 지연을 덮어쓰지 않는다. */}
      <style>{`
        .hero-word{display:inline-block;animation-name:hero-rise;animation-duration:.8s;animation-timing-function:cubic-bezier(.2,.8,.2,1);animation-fill-mode:both}
        @keyframes hero-rise{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        .hero-mark{background-image:linear-gradient(var(--brand),var(--brand));background-repeat:no-repeat;background-position:0 88%;background-size:100% 42%;animation-name:hero-rise,hero-mark-fill;animation-duration:.8s,.9s;animation-timing-function:cubic-bezier(.2,.8,.2,1);animation-fill-mode:both}
        @keyframes hero-mark-fill{from{background-size:0% 42%}to{background-size:100% 42%}}
        .hero-float,.hero-twinkle,.hero-bar,.hero-blob,.hero-pulse{transform-box:fill-box;transform-origin:center}
        .hero-float-a{animation:hero-float 5s ease-in-out infinite}
        .hero-float-b{animation:hero-float 6s ease-in-out -2s infinite}
        .hero-float-c{animation:hero-float 7s ease-in-out -4s infinite}
        @keyframes hero-float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-10px) rotate(2deg)}}
        .hero-dash{stroke-dasharray:6 9;animation:hero-flow 1.2s linear infinite}
        @keyframes hero-flow{to{stroke-dashoffset:-30}}
        .hero-twinkle{animation-name:hero-twinkle;animation-duration:2.4s;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
        @keyframes hero-twinkle{0%,100%{transform:scale(.6);opacity:.5}50%{transform:scale(1.15);opacity:1}}
        .hero-bar{transform-origin:left center;animation:hero-bar 3.6s ease-in-out infinite}
        @keyframes hero-bar{0%{transform:scaleX(.04)}70%,100%{transform:scaleX(1)}}
        .hero-blob{animation:hero-drift 12s ease-in-out infinite alternate}
        @keyframes hero-drift{from{transform:rotate(-4deg) scale(1)}to{transform:rotate(6deg) scale(1.05)}}
        .hero-pulse{animation:hero-pulse 2.4s ease-in-out infinite}
        @keyframes hero-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        @media (prefers-reduced-motion: reduce){
          .hero-word,.hero-mark,.hero-float-a,.hero-float-b,.hero-float-c,.hero-dash,.hero-twinkle,.hero-bar,.hero-blob,.hero-pulse{animation:none !important}
        }
      `}</style>

      <div className="text-center">
        <h1 className={HERO_TITLE}>
          <span className="hero-word [animation-delay:.05s]">
            영상 시안 제작,
          </span>
          <br />
          <span
            className="hero-word hero-mark [animation-delay:.25s,.8s]"
          >
            무제한 무료
          </span>
        </h1>
        <p
          className="hero-word text-muted-foreground mt-3 text-base [animation-delay:.7s]"
        >
          마음에 들면 그때 주문하세요
        </p>
      </div>

      <svg
        viewBox="0 0 520 400"
        role="img"
        aria-label="사진들이 모여 영상 시안이 되는 일러스트"
        className="mx-auto block w-full max-w-50"
      >
        <g className="hero-blob">
          <path className="fill-sky-100"
            d="M95 120 C90 40 200 -10 300 25 C400 55 500 90 490 190 C480 290 430 370 320 385 C210 400 110 380 60 300 C20 235 100 190 95 120Z"
          />
        </g>
        <path
          className="hero-dash stroke-ink"
          d="M130 200 C160 235 200 250 238 262"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="hero-dash stroke-ink"
          d="M290 150 C320 150 345 160 360 186"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="hero-dash stroke-ink"
          d="M176 300 C198 300 214 296 234 290"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g transform="translate(36 56) rotate(-9 60 75)">
          <g className="hero-float hero-float-a">
            <path className="fill-white stroke-ink"
              d="M4 6 Q60 0 116 5 Q121 78 117 146 Q60 152 3 147 Q-1 78 4 6Z"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect className="fill-sky-200 stroke-ink"
              x="12"
              y="12"
              width="96"
              height="100"
              rx="6"
              strokeWidth="2.5"
            />
            <circle className="fill-yellow-300 stroke-ink" cx="84" cy="36" r="11" strokeWidth="2.5" />
            <path className="fill-sky-400 stroke-ink"
              d="M12 112 L42 72 L66 98 L84 82 L108 112Z"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path className="stroke-ink"
              d="M20 130 Q60 126 100 131"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>
        <g transform="translate(176 22) rotate(7 60 75)">
          <g className="hero-float hero-float-b">
            <path className="fill-white stroke-ink"
              d="M4 6 Q60 0 116 5 Q121 78 117 146 Q60 152 3 147 Q-1 78 4 6Z"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect className="fill-pink-200 stroke-ink"
              x="12"
              y="12"
              width="96"
              height="100"
              rx="6"
              strokeWidth="2.5"
            />
            <path className="fill-rose-400 stroke-ink"
              d="M60 90 C30 70 34 46 50 46 C56 46 60 51 60 55 C60 51 64 46 70 46 C86 46 90 70 60 90Z"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path className="stroke-ink"
              d="M22 130 Q60 134 98 128"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>
        <g transform="translate(54 216) rotate(5 60 75)">
          <g className="hero-float hero-float-c">
            <path className="fill-white stroke-ink"
              d="M4 6 Q60 0 116 5 Q121 78 117 146 Q60 152 3 147 Q-1 78 4 6Z"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <rect className="fill-yellow-100 stroke-ink"
              x="12"
              y="12"
              width="96"
              height="100"
              rx="6"
              strokeWidth="2.5"
            />
            <circle className="stroke-ink" cx="46" cy="70" r="22" fill="none" strokeWidth="4" />
            <circle className="stroke-sky-700" cx="74" cy="70" r="22" fill="none" strokeWidth="4" />
            <path className="fill-white stroke-ink"
              d="M46 46 L40 38 L46 31 L52 38Z"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path className="stroke-ink"
              d="M20 131 Q60 127 100 132"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>
        <g transform="translate(236 190)">
          <path className="fill-sky-400 stroke-ink"
            d="M12 16 Q140 8 266 14 Q272 90 267 176 Q140 182 10 177 Q4 96 12 16Z"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path className="fill-white stroke-ink"
            d="M4 6 Q132 -2 258 5 Q264 82 259 164 Q132 170 2 165 Q-4 86 4 6Z"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path className="fill-sky-100 stroke-ink"
            d="M16 18 Q130 12 244 17 Q248 78 245 128 Q130 134 15 129 Q12 78 16 18Z"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g className="hero-pulse">
            <circle className="fill-sky-400 stroke-ink" cx="130" cy="74" r="26" strokeWidth="3" />
            <path className="fill-white stroke-ink"
              d="M122 60 L146 74 L122 88Z"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
          <path className="stroke-sky-200"
            d="M24 147 Q130 144 236 148"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            className="hero-bar stroke-ink"
            d="M24 147 Q130 144 236 148"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(452 64)">
          <path
            className="hero-twinkle fill-yellow-300 stroke-ink [animation-delay:.3s]"
            d="M0 -14 Q1 -1 14 0 Q1 1 0 14 Q-1 1 -14 0 Q-1 -1 0 -14Z"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
        <g transform="translate(24 40)">
          <path
            className="hero-twinkle fill-yellow-300 stroke-ink [animation-delay:1.1s]"
            d="M0 -10 Q1 -1 10 0 Q1 1 0 10 Q-1 1 -10 0 Q-1 -1 0 -10Z"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
        <g transform="translate(488 352)">
          <path
            className="hero-twinkle fill-yellow-300 stroke-ink [animation-delay:.7s]"
            d="M0 -10 Q1 -1 10 0 Q1 1 0 10 Q-1 1 -10 0 Q-1 -1 0 -10Z"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </g>
        <circle
          className="hero-twinkle fill-rose-400 [animation-delay:1.5s]"
          cx="214"
          cy="372"
          r="5"
        />
        <circle
          className="hero-twinkle fill-sky-400 [animation-delay:.9s]"
          cx="400"
          cy="150"
          r="4"
        />
      </svg>
    </section>
  );
}
