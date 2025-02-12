export interface RowData {
  id: string
  name: string
  raid: string
  status: string
  date: string
  time: string
  buyers: string
  difficulty: string
  loot: string
  team: string
  collector: string
  leader: string
  note: string
}

export const bookingData: RowData[] = [
  {
    id: "1234567abcde",
    name: "Heroic Armidrassil",
    raid: "Vault",
    status: "Locked",
    date: "2024-08-01",
    time: "12:00",
    buyers: "17",
    difficulty: "Heroic",
    loot: "Saved",
    team: "",
    collector: "Calma",
    leader: "Calmakarai-Area52",
    note: "AUSHdiuoASHdoiuHASidouhiosuadhiaushdniouasndioasdboasuigdhbouasgdoasgbdiouasdoiashdoiasd",
  },
]
