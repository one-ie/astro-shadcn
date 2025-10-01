import { atom, useAtom } from "jotai"
import { type Mail, mails } from "@/data/mail-data"

export type MailFolder = "inbox" | "drafts" | "sent" | "junk" | "trash" | "archive" | "social" | "updates" | "forums" | "shopping" | "promotions"

type Config = {
  selected: Mail["id"] | null
  activeFolder: MailFolder
  searchQuery: string
}

const configAtom = atom<Config>({
  selected: mails[0].id,
  activeFolder: "inbox",
  searchQuery: "",
})

export function useMail() {
  return useAtom(configAtom)
}
