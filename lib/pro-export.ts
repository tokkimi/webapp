import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { FinanceEntry, money, summarize } from './pro-finance'
export function downloadFile(bytes: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type })), a = document.createElement('a')
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000)
}
export async function reportPdf(entries: FinanceEntry[], from: string, to: string, practice: { practice_name?: string; profession?: string; address?: string; registration_number?: string } | null) {
  const doc = await PDFDocument.create(), font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold)
  let page = doc.addPage([595, 842]), y = 790
  const clean = (v: string) => [...v.replace(/[\u202f\u00a0]/g, ' ')].map(c => { try { font.encodeText(c); return c } catch { return '?' } }).join('')
  function line(value: string, size = 11, strong = false) {
    const text = clean(value), f = strong ? bold : font
    const words = text.split(/\s+/), lines: string[] = []; let current = ''
    for (const word of words) { if (f.widthOfTextAtSize(current + ' ' + word, size) > 490 && current) { lines.push(current); current = word } else current += (current ? ' ' : '') + word }
    lines.push(current)
    for (let item of lines) {
      while (f.widthOfTextAtSize(item, size) > 490) { let cut = item.length - 1; while (f.widthOfTextAtSize(item.slice(0, cut), size) > 490) cut--; draw(item.slice(0, cut)); item = item.slice(cut) }
      draw(item)
    }
    function draw(s: string) { if (y < 65) { page = doc.addPage([595, 842]); y = 790 } page.drawText(s, { x: 48, y, size, font: f, color: rgb(.08, .23, .19) }); y -= size + 8 }
  }
  line('CAPSULE PRO', 12, true); y -= 14; line('Bilan d’activité', 26, true); line(`${from} au ${to}`, 12); y -= 12
  line(practice?.practice_name || 'Cabinet professionnel', 15, true); if (practice?.profession) line(practice.profession); if (practice?.registration_number) line(practice.registration_number); if (practice?.address) line(practice.address); y -= 18
  const totals = summarize(entries)
  for (const [label, value] of [['Recettes encaissées', totals.income], ['Dépenses réglées', totals.expenses], ['Solde de trésorerie de la période', totals.balance], ['À encaisser', totals.receivable], ['À régler', totals.payable]] as const) line(`${label} : ${money(value)}`, 13, true)
  y -= 16; line('Synthèse des opérations saisies, en euros TTC. Les règlements sont rattachés à leur date de paiement ; les opérations en attente à la date de pièce. Les annulations sont exclues des totaux.', 10)
  line('Document de gestion interne, non certifié. Il ne constitue pas un bilan comptable réglementaire ni une déclaration fiscale.', 10); y -= 18
  line(`Détail des opérations (${entries.length})`, 15, true)
  for (const e of entries) { line(`${e.paid_on || e.occurred_on} | ${e.kind === 'income' ? 'Recette' : 'Dépense'} | ${money(e.amount_cents)} | ${{ paid: 'Réglé', pending: 'En attente', cancelled: 'Annulé' }[e.status]}`, 10, true); line(`${e.label} — ${e.category}${e.reference ? ' — Réf. ' + e.reference : ''}`, 10); y -= 5 }
  doc.getPages().forEach((p, i, all) => p.drawText(`Capsule Pro | ${i + 1} / ${all.length}`, { x: 48, y: 30, size: 9, font, color: rgb(.45, .5, .45) }))
  return await doc.save()
}
