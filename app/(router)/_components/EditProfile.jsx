"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";

const EditProfile = ({ name, value, updateInfo, onChange }) => {
  const [open, setOpen] = useState(false);

  const updateInformation = () => {
    updateInfo();

    alert(
      `Updated ${name} successfully.\nPlease refresh the page to see the changes.`
    );

    setOpen(false);

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <>
      {/* Edit Button */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-md hover:bg-gray-100 transition"
      >
        <SquarePen size={16} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-5">
              <h2 className="text-xl font-semibold capitalize">
                Edit {name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your details here. Don’t forget to click
                <span className="font-medium"> Save </span>
                once you're finished making changes.
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium capitalize">
                {name}
              </label>

              {value?.length < 30 ? (
                <input
                  type="text"
                  defaultValue={value}
                  onChange={onChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-black"
                />
              ) : (
                <textarea
                  defaultValue={value}
                  onChange={onChange}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none resize-none focus:ring-2 focus:ring-black"
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={updateInformation}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;