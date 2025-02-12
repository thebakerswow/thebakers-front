import { useState } from "react"
import { Megaphone, Pencil, Users, UserPlus } from "@phosphor-icons/react"
import amirdrassilCover from "../../../../assets/amirdrassil.png"
import { Modal } from "../../../../components/modal"
import { bookingData, RowData } from "../../../../assets/booking-data"

export function RunInfo() {
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false)

  function handleOpenAddBuyer() {
    setIsAddBuyerOpen(true)
  }

  function handleCloseAddBuyer() {
    setIsAddBuyerOpen(false)
  }

  // Seleciona os dados da run (pode ser dinâmico no futuro)
  const run: RowData = bookingData[0]

  return (
    <div className="flex m-4 gap-4 rounded-md">
      <img
        className="w-[400px] rounded-md"
        src={amirdrassilCover}
        alt="Run Cover"
      />
      <div className="grid grid-cols-4 flex-1 text-center bg-gray-300 rounded-md text-zinc-900">
        <div className="col-span-3">
          <h1 className="font-semibold text-lg">
            {run.name} - {run.date} @ {run.time}
          </h1>
          <div className="grid grid-cols-3 gap-4 mt-4 text-start ml-24">
            <p>
              <span className="font-bold text-base">Raid Id: </span>
              {run.id}
            </p>
            <p className="text-yellow-500 font-semibold">
              <span className="font-bold text-base text-zinc-900">
                Loot Type:{" "}
              </span>
              {run.loot}
            </p>
            <p className="text-red-500 font-semibold">
              <span className="font-bold text-base text-zinc-900">
                Buyers:{" "}
              </span>
              {run.buyers}
            </p>
            <p>
              <span className="font-bold text-base">Slots Available: </span>{" "}
            </p>
            <p>
              <span className="font-bold text-base">Backups: </span>{" "}
            </p>
            <p>
              <span className="font-bold text-base">Leader: </span> {run.leader}
            </p>
            <p>
              <span className="font-bold text-base">Gold Collector: </span>{" "}
              {run.collector}
            </p>
            <p className="text-yellow-500 font-semibold">
              <span className="font-bold text-base text-zinc-900">
                Status:{" "}
              </span>
              {run.status}
            </p>
            <p>
              <span className="font-bold text-base">Potential Pot: </span>{" "}
            </p>
            <p>
              <span className="font-bold text-base">Actual Pot: </span>{" "}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 m-4 justify-center items-center">
          <button
            className="flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center"
            onClick={handleOpenAddBuyer}
          >
            <UserPlus size={18} />
            Add Buyer
          </button>
          <button className="flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center">
            <Pencil size={18} />
            Edit Raid
          </button>
          <button className="flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center">
            <Users size={18} />
            Change Slots
          </button>
          <button className="flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 w-full justify-center">
            <Megaphone size={18} />
            Announcement
          </button>
        </div>
      </div>

      {isAddBuyerOpen && (
        <Modal onClose={handleCloseAddBuyer}>
          <div className="w-full max-w-[95vw] h-[360px] overflow-y-auto overflow-x-hidden flex flex-col">
            <form action="" className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Raider.io URL"
                className="col-span-2 p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
              <p className="-mt-3 ml-1 col-span-2 text-sm text-gray-400 leading-tight">
                (Optional) If you fill this in, the form will be auto-filled
                with the data from Raider.IO
              </p>
              <input
                type="text"
                placeholder="Payment Realm"
                className="p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
              <select className="p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition">
                <option value="" disabled selected hidden>
                  Payment Faction
                </option>
                <option value="horde">Horde</option>
                <option value="alliance">Alliance</option>
              </select>
              <input
                type="text"
                placeholder="Buyer Name-Realm"
                className="p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
              <select className="p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition">
                <option value="" disabled selected hidden>
                  Class
                </option>
                <option value="warrior">Warrior</option>
                <option value="paladin">Paladin</option>
                <option value="hunter">Hunter</option>
                <option value="rogue">Rogue</option>
                <option value="priest">Priest</option>
                <option value="shaman">Shaman</option>
                <option value="mage">Mage</option>
                <option value="warlock">Warlock</option>
                <option value="monk">Monk</option>
                <option value="druid">Druid</option>
                <option value="demonhunter">Demon Hunter</option>
                <option value="deathknight">Death Knight</option>
                <option value="evoker">Evoker</option>
              </select>
              <input
                type="text"
                placeholder="Pot"
                className="p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
              <select className="p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition">
                <option value="" disabled selected hidden>
                  Paid Full
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <input
                type="text"
                placeholder="Note"
                className="col-span-2 p-2 border rounded-md focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
            </form>
            <button className="flex items-center gap-2 bg-red-400 text-gray-100 hover:bg-red-500 rounded-md p-2 mt-4 justify-center">
              <UserPlus size={20} /> Add Buyer
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
