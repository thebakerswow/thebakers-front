import { useEffect, useRef, useState } from "react"
import { teamData } from "../../assets/team-data"
import { Eye, EyeSlash } from "@phosphor-icons/react"

// Lista de cores personalizáveis para fundo e texto
const backgroundColors = [
  { name: "Druid", code: "#FF7D0A" },
  { name: "Hunter", code: "#ABD473" },
  { name: "Mage", code: "#69CCF0" },
  { name: "Paladin", code: "#F58CBA" },
  { name: "Priest", code: "#FFFFFF" },
  { name: "Rogue", code: "#FFF569" },
  { name: "Shaman", code: "#0070DE" },
  { name: "Warlock", code: "#9482C9" },
  { name: "Warrior", code: "#C79C6E" },
  { name: "Evoker", code: "#33937F" },
  { name: "Death Knight", code: "#C41E3A" },
  { name: "Monk", code: "#00FF98" },
]

// Função para determinar se o texto deve ser claro ou escuro com base no fundo
const getTextColorForBackground = (backgroundColor: string): string => {
  // Convertendo a cor hex para valores RGB
  const color = backgroundColor.substring(1) // Remove #
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // Cálculo de luminância para definir clareza
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b

  // Se o fundo for claro, usa texto preto, caso contrário, texto branco
  return luminance > 186 ? "black" : "white"
}

export function BalanceDataGrid() {
  const [playerStyles, setPlayerStyles] = useState<{
    [key: string]: { background: string; text: string }
  }>({})
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showShopColumns, setShowShopColumns] = useState<boolean>(false)
  const [menuOpenForPlayer, setMenuOpenForPlayer] = useState<string | null>(
    null
  )
  const dropdownRef = useRef<HTMLDivElement>(null)
  const handleBackgroundChange = (player: string, background: string) => {
    const textColor = getTextColorForBackground(background) // Calcula a cor ideal para contraste
    setPlayerStyles((prev) => ({
      ...prev,
      [player]: { background, text: textColor },
    }))
    setMenuOpenForPlayer(null) // Fecha o dropdown após selecionar a cor
  }
  const toggleDropdown = (player: string, event: React.MouseEvent) => {
    event.stopPropagation() // Evita que o clique se propague para o restante da tabela
    setMenuOpenForPlayer((prev) => (prev === player ? null : player))
  }

  // Fecha o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpenForPlayer(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredData = selectedTeam
    ? teamData.filter((row) => row.team === selectedTeam)
    : teamData

  const toggleShopColumns = () => {
    setShowShopColumns((prev) => !prev)
  }

  const formatGold = (value: string | number) => {
    const numericValue = typeof value === "string" ? parseInt(value, 10) : value
    return new Intl.NumberFormat("en-US").format(numericValue)
  }

  return (
    <div>
      <div className="m-4 flex items-center">
        <label className="mr-2">Filter by Team:</label>
        <select
          value={selectedTeam || ""}
          onChange={(e) => setSelectedTeam(e.target.value || null)}
          className="pl-2 border rounded text-black"
        >
          <option value="">All Teams</option>
          <option value="1">Team 1</option>
          <option value="2">Team 2</option>
          <option value="3">Team 3</option>
          <option value="advertiser">Advertisers</option>
        </select>

        <button
          onClick={toggleShopColumns}
          className="ml-4 px-4 py-2  rounded text-white"
        >
          {showShopColumns ? <EyeSlash size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <table className="min-w-full border-collapse">
        <thead className="table-header-group">
          <tr className="text-md bg-zinc-400 text-gray-700">
            <th className="p-2 border" rowSpan={2}>
              Player
            </th>
            <th className="p-2 border" rowSpan={2}>
              Total Gold
            </th>
            {showShopColumns && (
              <th className="p-2 border" rowSpan={2}>
                Total Shop
              </th>
            )}
            {[
              // Dias da semana
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <th
                key={day}
                className="p-2 border"
                colSpan={showShopColumns ? 2 : 1}
              >
                {day}
              </th>
            ))}
          </tr>
          <tr className="text-md bg-zinc-300 text-gray-700">
            {Array.from({ length: 7 }, (_, i) => (
              <>
                <th key={`gold-${i}`} className="p-2 border">
                  Gold
                </th>
                {showShopColumns && (
                  <th key={`shop-${i}`} className="p-2 border">
                    $
                  </th>
                )}
              </>
            ))}
          </tr>
        </thead>
        <tbody className="table-row-group text-sm font-medium text-zinc-900">
          {filteredData.map((row, index) => (
            <tr
              key={row.player}
              className={`text-center ${
                index % 2 === 0 ? "bg-white" : "bg-zinc-200"
              }`}
            >
              {/* Primeira célula com o nome do jogador e lógica de estilo */}
              <td
                className="relative p-0 border border-b-black border-l-0"
                style={{
                  backgroundColor:
                    playerStyles[row.player]?.background || "white",
                  color: playerStyles[row.player]?.text || "black",
                }}
              >
                <div
                  className="absolute inset-0 w-2 bg-gray-600 cursor-pointer z-20"
                  onClick={(e) => toggleDropdown(row.player, e)}
                ></div>
                {menuOpenForPlayer === row.player && (
                  <div
                    ref={dropdownRef}
                    className="absolute left-4 top-0 mt-1 w-64 bg-white border shadow-md z-50 p-2"
                  >
                    <h4 className="font-semibold mb-1 text-black">
                      Background Color
                    </h4>
                    {backgroundColors.map((color) => (
                      <div
                        key={color.code}
                        className="cursor-pointer mb-1 p-1"
                        style={{
                          backgroundColor: color.code,
                          borderRadius: "4px",
                          textAlign: "center",
                          color: getTextColorForBackground(color.code),
                          fontSize: "12px",
                        }}
                        onClick={() =>
                          handleBackgroundChange(row.player, color.code)
                        }
                      >
                        {color.name}
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative z-10 flex items-center justify-center h-full text-sm">
                  {row.player}
                </div>
              </td>

              <td className="p-2 border border-b-black">
                {formatGold(row.totalGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">U${row.totalShop}</td>
              )}
              <td className="p-2 border border-b-black">
                {formatGold(row.mondayGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">
                  U${row.mondayShop}
                </td>
              )}
              <td className="p-2 border border-b-black">
                {formatGold(row.tuesdayGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">
                  U${row.tuesdayShop}
                </td>
              )}
              <td className="p-2 border border-b-black">
                {formatGold(row.wednesdayGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">
                  U${row.wednesdayShop}
                </td>
              )}
              <td className="p-2 border border-b-black">
                {formatGold(row.thursdayGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">
                  U${row.thursdayShop}
                </td>
              )}
              <td className="p-2 border border-b-black">
                {formatGold(row.fridayGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">
                  U${row.fridayShop}
                </td>
              )}
              <td className="p-2 border border-b-black">
                {formatGold(row.saturdayGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">
                  U${row.saturdayShop}
                </td>
              )}
              <td className="p-2 border border-b-black">
                {formatGold(row.sundayGold)}g
              </td>
              {showShopColumns && (
                <td className="p-2 border border-b-black">
                  U${row.sundayShop}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
