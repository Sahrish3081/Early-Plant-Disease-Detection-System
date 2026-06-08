const LeafBg = () => (
  <svg className="leaf-bg" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="leafGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#2d6a4f" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#1b4332" stopOpacity="0"   />
      </radialGradient>
    </defs>

    {[
      { d: "M100,300 Q150,200 200,250 Q250,300 200,350 Q150,400 100,300Z", op: 0.12 },
      { d: "M600,100 Q670,60  720,120 Q770,180 700,200 Q630,220 600,100Z", op: 0.10 },
      { d: "M50,500  Q120,440 170,490 Q220,540 160,570 Q100,600 50,500Z",  op: 0.08 },
      { d: "M680,450 Q740,390 780,440 Q820,490 760,510 Q700,530 680,450Z", op: 0.09 },
      { d: "M350,50  Q400,10  440,60  Q480,110 420,130 Q360,150 350,50Z",  op: 0.07 },
    ].map((leaf, i) => (
      <path
        key={i}
        d={leaf.d}
        fill="#52b788"
        fillOpacity={leaf.op}
        style={{ animation: `leafFloat ${6 + i}s ease-in-out infinite alternate` }}
      />
    ))}
  </svg>
);

export default LeafBg;
