import { useState, useEffect } from "react"
import { CheckFat, UserPlus, XCircle } from "@phosphor-icons/react"
import DeathKnight from "../../../../assets/class_icons/deathknight.png"
import DemonHunter from "../../../../assets/class_icons/demonhunter.png"
import Druid from "../../../../assets/class_icons/druid.png"
import Evoker from "../../../../assets/class_icons/evoker.png"
import Hunter from "../../../../assets/class_icons/hunter.png"
import Mage from "../../../../assets/class_icons/mage.png"
import Monk from "../../../../assets/class_icons/monk.png"
import Paladin from "../../../../assets/class_icons/paladin.png"
import Priest from "../../../../assets/class_icons/priest.png"
import Rogue from "../../../../assets/class_icons/rogue.png"
import Shaman from "../../../../assets/class_icons/shaman.png"
import Warlock from "../../../../assets/class_icons/warlock.png"
import Warrior from "../../../../assets/class_icons/warrior.png"

interface BuyerData {
  status: string // Assegure-se de que esta propriedade esteja sempre como string
  name: string
  faction: string
  class: string
  source: string
  advertiser: string
  collectedBy: string
  paidFull: string
  note: string
  actions: string
}

interface BuyersGridProps {
  data: BuyerData[]
}

const statusPriorities: Record<string, number> = {
  done: 1,
  group: 2,
  waiting: 3,
  backup: 4,
  noshow: 5,
  closed: 6,
}

export function BuyersDataGrid({ data }: BuyersGridProps) {
  const [sortedData, setSortedData] = useState<BuyerData[]>(data)

  useEffect(() => {
    const orderData = [...data].sort((a, b) => {
      const priorityA = statusPriorities[a.status] || 99
      const priorityB = statusPriorities[b.status] || 99
      return priorityA - priorityB
    })
    setSortedData(orderData)
  }, [data])

  const countStatus = (status: string) => {
    return sortedData.filter((item) => item.status === status).length
  }

  const waitingCount = countStatus("waiting")
  const groupCount = countStatus("group")

  const handleStatusChange = (index: number, newStatus: string) => {
    const updatedData = [...sortedData]
    updatedData[index].status = newStatus || "" // Usa string vazia se newStatus for undefined ou null
    // Reordena os dados após a atualização do status
    const orderData = updatedData.sort((a, b) => {
      const priorityA = statusPriorities[a.status] || 99
      const priorityB = statusPriorities[b.status] || 99
      return priorityA - priorityB
    })
    setSortedData(orderData)
  }

  function getClassImage(className: string): string {
    switch (className) {
      case "Warrior":
        return Warrior
      case "Paladin":
        return Paladin
      case "Hunter":
        return Hunter
      case "Rogue":
        return Rogue
      case "Priest":
        return Priest
      case "Shaman":
        return Shaman
      case "Mage":
        return Mage
      case "Warlock":
        return Warlock
      case "Monk":
        return Monk
      case "Druid":
        return Druid
      case "Demon Hunter":
        return DemonHunter
      case "Death Knight":
        return DeathKnight
      case "Evoker":
        return Evoker
      default:
        return "" // Retorna uma string vazia se a classe não for reconhecida
    }
  }

  function getRowColor(status: string): string {
    switch (status) {
      case "waiting":
        return "bg-yellow-200"
      case "backup":
        return "bg-purple-300"
      case "group":
        return "bg-blue-300"
      case "done":
        return "bg-green-300"
      case "noshow":
        return "bg-red-500"
      case "closed":
        return "bg-zinc-400"
      case "":
        return "bg-white"
      default:
        return "bg-white"
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mb-2">
          <UserPlus size={18} />
          Invite Buyers
        </button>
        <div className=" gap-2 flex p-2 mb-2 rounded-md bg-zinc-200 text-gray-700">
          <span className="">Waiting: {waitingCount}</span>
          <span className="">Group: {groupCount}</span>
        </div>
      </div>

      <table className="min-w-full border-collapse">
        <thead className="table-header-group">
          <tr className="text-md bg-zinc-400 text-gray-700">
            <th className="p-2 border">Slot</th>
            <th className="p-2 border w-[100px]">Status</th>
            <th className="p-2 border">Name-Realm</th>
            <th className="p-2 border">Faction</th>
            <th className="p-2 border">Class</th>
            <th className="p-2 border">Advertiser</th>
            <th className="p-2 border">Collected By</th>
            <th className="p-2 border">Paid Full</th>
            <th className="p-2 border">Note</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody className="table-row-group text-sm font-medium text-zinc-900 bg-zinc-200">
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={`border border-gray-300 ${getRowColor(row.status)}`}
            >
              <td className="p-2 text-center">{index + 1}</td>{" "}
              {/* Gera slots automaticamente com base no índice */}
              <td className="p-2">
                <form action="">
                  <select
                    className="bg-zinc-100 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    value={row.status || ""} // Use uma string vazia como valor padrão
                    onChange={(e) => handleStatusChange(index, e.target.value)}
                  >
                    <option value="" disabled hidden>
                      ----------
                    </option>
                    <option value="waiting">Waiting</option>
                    <option value="noshow">No Show</option>
                    <option value="closed">Closed</option>
                    <option value="backup">Backup</option>
                    <option value="group">Group</option>
                    <option value="done">Done</option>
                  </select>
                </form>
              </td>
              <td className="p-2 text-center">{row.name}</td>
              <td className="p-2 text-center">{row.faction}</td>
              <td className="p-2 flex gap-2 justify-center">
                {row.class}
                {getClassImage(row.class) ? (
                  <img
                    src={getClassImage(row.class)}
                    alt={row.class}
                    className="w-6 h-6"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 flex justify-center items-center rounded">
                    ? {/* Placeholder para imagem não encontrada */}
                  </div>
                )}
              </td>
              <td className="p-2 text-center">{row.advertiser}</td>
              <td className="p-2 text-center">{row.collectedBy}</td>
              <td className="p-2 w-20 text-center">
                <div className="flex justify-center items-center">
                  {row.paidFull === "check" ? (
                    <CheckFat
                      className="text-green-500 border bg-white rounded-xl"
                      size={22}
                      weight="fill"
                    />
                  ) : (
                    <XCircle
                      className="text-red-600 border bg-white rounded-xl"
                      size={22}
                      weight="fill"
                    />
                  )}
                </div>
              </td>
              <td className="p-2 text-center">{row.note}</td>
              <td className="p-2 text-center">{row.actions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
