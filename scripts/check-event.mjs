import { readFile } from 'node:fs/promises'

const text = await readFile(new URL('../EVENT.md', import.meta.url), 'utf8')
if (text.includes('<START-CODE>')) {
  console.error('\nEVENT.md still contains <START-CODE>. Replace it with the organizer-issued event start code before the FIRST commit.\n')
  process.exit(1)
}
if (!text.includes('LSH26-T022') || !text.includes('P07') || !text.includes('lsh26-t022-p07')) {
  console.error('EVENT.md identity fields do not match the P07 repository lock.')
  process.exit(1)
}
console.log('EVENT.md first-commit guard passed.')
