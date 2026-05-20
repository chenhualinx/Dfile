import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { parse, stringify } from "yaml"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const translationsDir = join(__dirname, "../src/i18n/translations")
const localesDir = join(__dirname, "../src/i18n/locales")

interface NestedMap {
  [key: string]: string | NestedMap
}

function extractLanguage(data: NestedMap, lang: string, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(data)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "string") {
      result[path] = value
    } else if (value && typeof value === "object") {
      if (lang in value) {
        result[path] = (value as Record<string, string>)[lang]
      } else {
        Object.assign(result, extractLanguage(value as NestedMap, lang, path))
      }
    }
  }
  return result
}

function buildTranslations() {
  mkdirSync(localesDir, { recursive: true })
  const translationFiles = readdirSync(translationsDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))

  // Collect all language codes
  const allData: Record<string, NestedMap> = {}
  const languages = new Set<string>()

  for (const file of translationFiles) {
    const content = readFileSync(join(translationsDir, file), "utf-8")
    const data = parse(content) as NestedMap
    allData[file.replace(/\.(yaml|yml)$/, "")] = data
  }

  // Detect languages from translation files
  for (const data of Object.values(allData)) {
    extractLanguages(data, languages)
  }

  // Build per-language JSON
  for (const lang of languages) {
    const langData: Record<string, string> = {}
    for (const [moduleName, data] of Object.entries(allData)) {
      const extracted = extractLanguage(data, lang, moduleName)
      // Re-nest: module.key -> { module: { key: value } }
      for (const [path, value] of Object.entries(extracted)) {
        const parts = path.split(".")
        let current = langData
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = current[parts[i]] || {}
          current = current[parts[i]] as Record<string, string>
        }
        current[parts[parts.length - 1]] = value
      }
    }
    writeFileSync(join(localesDir, `${lang}.json`), JSON.stringify(langData, null, 2))
    console.log(`Built ${lang}.json`)
  }
}

function extractLanguages(data: NestedMap, langs: Set<string>) {
  for (const value of Object.values(data)) {
    if (typeof value === "object" && value !== null) {
      // Check if this is a language map (keys are language codes)
      const keys = Object.keys(value)
      if (keys.every((k) => k.includes("-") || k.length <= 5)) {
        keys.forEach((k) => langs.add(k))
      } else {
        extractLanguages(value as NestedMap, langs)
      }
    }
  }
}

buildTranslations()
