import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

/* ── Canvas Drawing Utilities ─────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function foldCorner(ctx, W, size) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.moveTo(W - size, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, size);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(W - size, 0);
  ctx.lineTo(W, size);
  ctx.stroke();
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  words.forEach(word => {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lineH;
      line = word;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, x, y);
}

function drawFront(canvas, data, photoImg) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const s = W / 243;

  ctx.clearRect(0, 0, W, H);

  const DARK      = '#0f1f45';
  const NAVY      = '#1a2e5a';
  const SLATE     = '#edf1fb';
  const PHOTO_BG  = '#d4dcf0';
  const PHOTO_STR = '#a8badc';
  const AVATAR_CLR = '#9fb3d4';

  // Card background
  roundRect(ctx, 0, 0, W, H, 12 * s);
  ctx.fillStyle = SLATE;
  ctx.fill();

  // Header
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.moveTo(0, 12 * s);
  ctx.quadraticCurveTo(0, 0, 12 * s, 0);
  ctx.lineTo(W - 12 * s, 0);
  ctx.quadraticCurveTo(W, 0, W, 12 * s);
  ctx.lineTo(W, 82 * s);
  ctx.lineTo(0, 82 * s);
  ctx.closePath();
  ctx.fill();

  foldCorner(ctx, W, 26 * s);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = `bold ${20 * s}px 'DM Sans', Arial, sans-serif`;
  ctx.fillText((data.company || 'TAYLORMADE').toUpperCase(), W / 2, 33 * s);

  ctx.font = `${10 * s}px 'DM Sans', Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText((data.branch || 'ALESSO BRANCH').toUpperCase(), W / 2, 50 * s);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(18 * s, 62 * s);
  ctx.lineTo(W - 18 * s, 62 * s);
  ctx.stroke();

  // Photo box
  const pw = 103 * s;
  const ph = 103 * s;
  const px = (W - pw) / 2;
  const py = 95 * s;
  const pr = 8 * s;

  roundRect(ctx, px, py, pw, ph, pr);
  ctx.fillStyle = PHOTO_BG;
  ctx.fill();
  ctx.strokeStyle = PHOTO_STR;
  ctx.lineWidth = 1 * s;
  ctx.stroke();

  if (photoImg) {
    ctx.save();
    roundRect(ctx, px, py, pw, ph, pr);
    ctx.clip();
    ctx.drawImage(photoImg, px, py, pw, ph);
    ctx.restore();
  } else {
    ctx.fillStyle = AVATAR_CLR;
    ctx.beginPath();
    ctx.arc(W / 2, 133 * s, 22 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(W / 2, 176 * s, 30 * s, 18 * s, 0, Math.PI, 0);
    ctx.fill();
  }

  // Name band
  const bandY = 211 * s;
  const bandH = 50 * s;
  roundRect(ctx, 12 * s, bandY, W - 24 * s, bandH, 5 * s);
  ctx.fillStyle = NAVY;
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `${7.5 * s}px 'DM Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('FULL NAME', W / 2, bandY + 13 * s);

  const last     = data.lastName  || 'Last';
  const first    = data.firstName || 'First';
  const mi       = data.mi        || 'M.';
  const fullName = `${last}, ${first} ${mi}`;

  let fs = 15 * s;
  ctx.font = `600 ${fs}px 'DM Sans', Arial, sans-serif`;
  while (ctx.measureText(fullName).width > (W - 36 * s) && fs > 9 * s) {
    fs -= 0.4 * s;
    ctx.font = `600 ${fs}px 'DM Sans', Arial, sans-serif`;
  }
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(fullName, W / 2, bandY + 34 * s);``

  // Footer
  const footerY = H - 34 * s;
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(W, footerY);
  ctx.lineTo(W, H - 12 * s);
  ctx.quadraticCurveTo(W, H, W - 12 * s, H);
  ctx.lineTo(12 * s, H);
  ctx.quadraticCurveTo(0, H, 0, H - 12 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `${8 * s}px 'DM Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${data.company || 'Taylormade Group'}  |  ${data.branch || 'Alesso Branch'}`, W / 2, H - 13 * s);
}

function drawBack(canvas, data) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const s = W / 243;

  ctx.clearRect(0, 0, W, H);

  const DARK  = '#0f1f45';
  const NAVY  = '#1a2e5a';
  const SLATE = '#edf1fb';
  const FIELD = '#dce4f5';

  roundRect(ctx, 0, 0, W, H, 12 * s);
  ctx.fillStyle = SLATE;
  ctx.fill();

  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.moveTo(0, 12 * s);
  ctx.quadraticCurveTo(0, 0, 12 * s, 0);
  ctx.lineTo(W - 12 * s, 0);
  ctx.quadraticCurveTo(W, 0, W, 12 * s);
  ctx.lineTo(W, 74 * s);
  ctx.lineTo(0, 74 * s);
  ctx.closePath();
  ctx.fill();

  foldCorner(ctx, W, 22 * s);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${13 * s}px 'DM Sans', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('EMERGENCY CONTACT', W / 2, 27 * s);

  ctx.font = `${9 * s}px 'DM Sans', Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('Information', W / 2, 43 * s);

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(18 * s, 56 * s);
  ctx.lineTo(W - 18 * s, 56 * s);
  ctx.stroke();

  function drawField(label, value, y, boxHeight) {
    ctx.fillStyle = '#7a8fb5';
    ctx.font = `${7.5 * s}px 'DM Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(label, 18 * s, y * s);

    roundRect(ctx, 14 * s, (y + 4) * s, (W - 28 * s), boxHeight * s, 4 * s);
    ctx.fillStyle = FIELD;
    ctx.fill();

    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(14 * s, (y + 4) * s);
    ctx.lineTo(14 * s, (y + 4 + boxHeight) * s);
    ctx.stroke();

    if (value) {
      ctx.fillStyle = '#1a2e5a';
      ctx.textAlign = 'left';
      if (boxHeight > 28) {
        ctx.font = `${8 * s}px 'DM Sans', Arial, sans-serif`;
        wrapText(ctx, value, 22 * s, (y + 17) * s, (W - 44 * s), 12 * s);
      } else {
        ctx.font = `${9 * s}px 'DM Sans', Arial, sans-serif`;
        ctx.fillText(value, 22 * s, (y + 4 + boxHeight * 0.65) * s);
      }
    }
  }

  drawField('EMERGENCY CONTACT NAME', data.ecName,  86, 26);
  drawField('RELATIONSHIP TO WORKER', data.ecRel,  126, 26);
  drawField('CONTACT NUMBER',         data.ecPhone, 166, 26);
  drawField('CONTACT ADDRESS',        data.ecAddr,  206, 42);

  // Signature lines
  const sigY = 264 * s;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.moveTo(16 * s, sigY);
  ctx.lineTo(96 * s, sigY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - 96 * s, sigY);
  ctx.lineTo(W - 16 * s, sigY);
  ctx.stroke();

  ctx.fillStyle = '#8a9bbf';
  ctx.font = `${7 * s}px 'DM Sans', Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText("Worker's Signature", 56 * s, sigY + 10 * s);
  ctx.fillText("Authorized Signatory", W - 56 * s, sigY + 10 * s);

  // Footer
  const footerY = H - 34 * s;
  ctx.fillStyle = DARK;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(W, footerY);
  ctx.lineTo(W, H - 12 * s);
  ctx.quadraticCurveTo(W, H, W - 12 * s, H);
  ctx.lineTo(12 * s, H);
  ctx.quadraticCurveTo(0, H, 0, H - 12 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `${8 * s}px 'DM Mono', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${data.company || 'Taylormade Group'}  |  ${data.branch || 'Alesso Branch'}`, W / 2, H - 13 * s);
}

/* ── Sub-components ────────────────────────────────── */

function FormField({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}

function Divider() {
  return <div className="divider" />;
}

function PhotoUpload({ photoSrc, onUpload }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => onUpload(img, ev.target.result);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="photo-upload" onClick={() => inputRef.current.click()}>
        <div className="photo-upload-inner">
          {photoSrc ? (
            <img src={photoSrc} className="photo-thumb" alt="Employee" />
          ) : (
            <div className="photo-thumb-placeholder">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
          <div className="photo-text">
            <strong>Click to upload 2×2 photo</strong>
            <p>JPG or PNG · Square crop recommended</p>
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}

function TabSwitcher({ active, onChange }) {
  const tabs = [
    { id: 'front', label: 'ID Front' },
    { id: 'back',  label: 'Emergency Back' },
    { id: 'both',  label: 'Both' },
  ];
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`tab ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function FormatSelector({ current, onChange }) {
  return (
    <div className="fmt-row">
      <span className="fmt-label">Format:</span>
      <div className="fmt-group">
        {['PNG', 'JPG', 'PDF'].map(f => (
          <button
            key={f}
            className={`fmt-btn ${current === f ? 'active' : ''}`}
            onClick={() => onChange(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 15V3m0 12l-4-4m4 4l4-4"/>
      <path d="M2 17v2a2 2 0 002 2h16a2 2 0 002-2v-2"/>
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9V2h12v7"/>
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  );
}

/* ── Main App ──────────────────────────────────────── */
export default function App() {
  const [formData, setFormData] = useState({
    company:   'Taylormade',
    branch:    'Alesso Branch',
    lastName:  '',
    firstName: '',
    mi:        '',
    ecName:    '',
    ecRel:     '',
    ecPhone:   '',
    ecAddr:    '',
  });

  const [photoImg, setPhotoImg]     = useState(null);
  const [photoSrc, setPhotoSrc]     = useState(null);
  const [activeTab, setActiveTab]   = useState('front');
  const [currentFmt, setCurrentFmt] = useState('PNG');

  const frontRef  = useRef(null);
  const backRef   = useRef(null);
  const front2Ref = useRef(null);
  const back2Ref  = useRef(null);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = useCallback((img, src) => {
    setPhotoImg(img);
    setPhotoSrc(src);
  }, []);

  // Re-render canvases on every state change
  useEffect(() => {
    if (frontRef.current)  drawFront(frontRef.current, formData, photoImg);
    if (backRef.current)   drawBack(backRef.current, formData);
    if (activeTab === 'both') {
      if (front2Ref.current) drawFront(front2Ref.current, formData, photoImg);
      if (back2Ref.current)  drawBack(back2Ref.current, formData);
    }
  }, [formData, photoImg, activeTab]);

  /* ── Export helpers ── */
  function canvasToBlob(canvas, fmt) {
    return new Promise(resolve => {
      const mime    = fmt === 'JPG' ? 'image/jpeg' : 'image/png';
      const quality = fmt === 'JPG' ? 0.92 : 1;
      canvas.toBlob(resolve, mime, quality);
    });
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportPDF(canvases, filename) {
    const { jsPDF } = window.jspdf;
    const CARD_W = 54, CARD_H = 85.6, GAP = 6;
    let doc;
    if (canvases.length === 1) {
      doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [CARD_W, CARD_H] });
      doc.addImage(canvases[0].toDataURL('image/png'), 'PNG', 0, 0, CARD_W, CARD_H);
    } else {
      doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [CARD_W * 2 + GAP, CARD_H] });
      canvases.forEach((c, i) => {
        doc.addImage(c.toDataURL('image/png'), 'PNG', i * (CARD_W + GAP), 0, CARD_W, CARD_H);
      });
    }
    doc.save(filename);
  }

  async function downloadFront() {
    const c = frontRef.current;
    if (currentFmt === 'PDF') { exportPDF([c], 'id-front.pdf'); return; }
    const blob = await canvasToBlob(c, currentFmt);
    triggerDownload(blob, `id-front.${currentFmt.toLowerCase()}`);
  }

  async function downloadBack() {
    const c = backRef.current;
    if (currentFmt === 'PDF') { exportPDF([c], 'id-back.pdf'); return; }
    const blob = await canvasToBlob(c, currentFmt);
    triggerDownload(blob, `id-back.${currentFmt.toLowerCase()}`);
  }

  async function downloadBoth() {
    const cf = frontRef.current;
    const cb = backRef.current;
    if (currentFmt === 'PDF') { exportPDF([cf, cb], 'id-set.pdf'); return; }
    const ext   = currentFmt.toLowerCase();
    const blobF = await canvasToBlob(cf, currentFmt);
    const blobB = await canvasToBlob(cb, currentFmt);
    triggerDownload(blobF, `id-front.${ext}`);
    setTimeout(() => triggerDownload(blobB, `id-back.${ext}`), 400);
  }

  function printCards() {
    const frontUrl = frontRef.current.toDataURL('image/png');
    const backUrl  = backRef.current.toDataURL('image/png');
    const win = window.open('', '_blank', 'width=700,height=500');
    win.document.write(`
      <!DOCTYPE html><html><head><title>Print ID Cards — Taylormade</title>
      <style>
        @media print { @page { size: 4.5in 3.75in; margin: 0.25in; } }
        body { margin:0; display:flex; justify-content:center; align-items:center;
               gap:20px; padding:16px; background:#fff; }
        img { width:2.125in; height:3.375in; border-radius:10px;
              box-shadow:0 2px 10px rgba(0,0,0,0.15); }
      </style></head><body>
        <img src="${frontUrl}" alt="ID Front"/>
        <img src="${backUrl}"  alt="ID Back"/>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `);
    win.document.close();
  }

  /* ── Render ── */
  return (
    <div className="shell">

      {/* ── LEFT PANEL ── */}
      <div className="left">
        <div className="left-header">
          <h1>ID Card Generator</h1>
          <p>Taylormade Group · Alesso Branch</p>
        </div>

        <SectionLabel>Company info</SectionLabel>
        <div className="row2">
          <FormField label="Company name">
            <input name="company" value={formData.company} onChange={handleInput} />
          </FormField>
          <FormField label="Branch name">
            <input name="branch" value={formData.branch} onChange={handleInput} />
          </FormField>
        </div>

        <Divider />

        <SectionLabel>Employee photo</SectionLabel>
        <PhotoUpload photoSrc={photoSrc} onUpload={handlePhotoUpload} />

        <Divider />

        <SectionLabel>Employee name</SectionLabel>
        <div className="row3">
          <FormField label="Last name">
            <input name="lastName" value={formData.lastName} placeholder="Cruz" onChange={handleInput} />
          </FormField>
          <FormField label="First name">
            <input name="firstName" value={formData.firstName} placeholder="Juan" onChange={handleInput} />
          </FormField>
          <FormField label="M.I.">
            <input name="mi" value={formData.mi} placeholder="D." maxLength={4} onChange={handleInput} />
          </FormField>
        </div>

        <Divider />

        <SectionLabel>Emergency contact</SectionLabel>
        <FormField label="Contact name">
          <input name="ecName" value={formData.ecName} placeholder="Maria Cruz" onChange={handleInput} />
        </FormField>
        <FormField label="Relationship to worker">
          <input name="ecRel" value={formData.ecRel} placeholder="Spouse" onChange={handleInput} />
        </FormField>
        <FormField label="Contact number">
          <input name="ecPhone" value={formData.ecPhone} placeholder="+63 900 000 0000" onChange={handleInput} />
        </FormField>
        <FormField label="Contact address">
          <textarea
            name="ecAddr"
            value={formData.ecAddr}
            placeholder="123 Main St, Quezon City, Metro Manila"
            onChange={handleInput}
          />
        </FormField>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="right">
        <div className="right-header">
          <h2>Live Preview</h2>
          <span className="status-badge">
            <span className="status-dot" />
            Auto-updating
          </span>
        </div>

        <TabSwitcher active={activeTab} onChange={setActiveTab} />

        <div className="preview-area">
          <canvas
            ref={frontRef}
            width={243}
            height={387}
            style={{ display: activeTab === 'front' ? 'block' : 'none' }}
          />
          <canvas
            ref={backRef}
            width={243}
            height={387}
            style={{ display: activeTab === 'back' ? 'block' : 'none' }}
          />
          <div
            className="both-view"
            style={{ display: activeTab === 'both' ? 'flex' : 'none' }}
          >
            <canvas ref={front2Ref} width={195} height={311} />
            <canvas ref={back2Ref}  width={195} height={311} />
          </div>
        </div>

        <div className="export-panel">
          <div className="export-panel-label">Export options</div>
          <FormatSelector current={currentFmt} onChange={setCurrentFmt} />
          <div className="export-bar">
            <button className="btn btn-primary" onClick={downloadFront}>
              <DownloadIcon /> Download Front
            </button>
            <button className="btn btn-primary" onClick={downloadBack}>
              <DownloadIcon /> Download Back
            </button>
            <button className="btn btn-outline" onClick={downloadBoth}>
              <DownloadIcon /> Download Both
            </button>
            <button className="btn btn-outline" onClick={printCards}>
              <PrintIcon /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}