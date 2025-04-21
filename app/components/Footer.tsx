import { FaInstagram, FaTwitter, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="p-6 text-gray-300 bg-custom-1">
      <div className="container mx-auto space-y-4 text-center">
        <h5 className="text-lg font-semibold text-gray-100 uppercase">
          Follow Us
        </h5>
        <div className="flex justify-center space-x-6">
          <a
            title="Instagram"
            href="https://instagram.com"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-pink-500"
          >
            <FaInstagram size={24} />
          </a>
          <a
            title="Twitter"
            href="https://x.com"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-blue-500"
          >
            <FaTwitter size={24} />
          </a>
          <a
            title="Discord"
            href="https://discord.com"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-indigo-500"
          >
            <FaDiscord size={24} />
          </a>
        </div>
        <p className="text-sm">
          Email:{" "}
          <a
            href="mailto:biogames435@gmail.com"
            className="text-gray-100 hover:underline"
          >
            biogames435@gmail.com
          </a>
        </p>
        <p className="text-sm">
          Created by{" "}
          <a
            href="https://www.linkedin.com/in/manuel-meiri%C3%B1o-7b9214331/"
            className="text-gray-100 hover:underline"
          >
            Manuel Meiriño
          </a>
        </p>
        <p className="text-sm">
          Inspired by{" "}
          <a
            href="https://futbol-11.com"
            target="_blank"
            rel="noopener"
            className="text-gray-100 hover:underline"
          >
            futbol-11.com
          </a>
        </p>
      </div>
    </footer>
  );
}
