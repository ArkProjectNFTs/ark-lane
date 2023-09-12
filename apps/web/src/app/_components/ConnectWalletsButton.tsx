"use client";

import { Typography } from "design-system";
import Image from "next/image";
import { useState } from "react";

import ConnectModal from "./ConnectModal";

export default function ConnectWalletsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <>
      <button
        className="mx-auto mb-10.5 mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-dark-blue-950 py-3.5 dark:bg-sunshine-yellow-400 sm:mb-23 sm:mt-12 sm:w-auto sm:px-6 sm:py-5"
        onClick={openModal}
      >
        <svg
          className="text-white dark:text-black"
          fill="none"
          height="32"
          viewBox="0 0 32 32"
          width="32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 13C2 10.7909 3.79086 9 6 9H22C24.2091 9 26 10.7909 26 13V24C26 26.2091 24.2091 28 22 28H6C3.79086 28 2 26.2091 2 24V13Z"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M25.5 15H18C16.8954 15 16 15.8954 16 17V20C16 21.1046 16.8954 22 18 22H25.5"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
          />
          <path
            d="M29 24C29 24.5523 29.4477 25 30 25C30.5523 25 31 24.5523 31 24H29ZM3.91089 8.99858L3.29307 8.21227H3.29307L3.91089 8.99858ZM7.64021 6.06841L7.02239 5.28209V5.28209L7.64021 6.06841ZM10.7293 6H23V4H10.7293V6ZM29 12V24H31V12H29ZM4.52871 9.7849L8.25803 6.85473L7.02239 5.28209L3.29307 8.21227L4.52871 9.7849ZM1 12.9302V16H3V12.9302H1ZM3.29307 8.21227C1.84533 9.34978 1 11.089 1 12.9302H3C3 11.7027 3.56355 10.5432 4.52871 9.7849L3.29307 8.21227ZM23 6C26.3137 6 29 8.68629 29 12H31C31 7.58172 27.4183 4 23 4V6ZM10.7293 4C9.38493 4 8.0795 4.4515 7.02239 5.28209L8.25803 6.85473C8.96277 6.301 9.83306 6 10.7293 6V4Z"
            fill="currentColor"
          />
        </svg>

        <Typography
          className="text-white dark:text-black"
          variant="button_text_l"
        >
          Connect wallets
        </Typography>
      </button>
      <ConnectModal
        isOpen={isModalOpen}
        // key used to reset the internal states of ConnectModal when isModalOpen changes
        key={isModalOpen ? "open" : "closed"}
        onOpenChange={(open) => setIsModalOpen(open)}
      />
    </>
  );
}
