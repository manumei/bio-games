import { FaDiscord, FaInstagram, FaTwitter } from "react-icons/fa";
import { SITE_CONFIG } from "@/lib/site";

export default function Footer() {
  const { social, contactEmail, creator, inspiration } = SITE_CONFIG;

  return (
    <footer className="p-6 text-gray-300 bg-surface">
      <div className="container mx-auto space-y-4 text-center">
        <h5 className="text-lg font-semibold text-gray-100 uppercase">
          Follow Us
        </h5>
        <div className="flex justify-center space-x-6">
          {social.instagram && (
            <a
              title="Instagram"
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-pink-500"
            >
              <FaInstagram size={24} />
            </a>
          )}
          {social.x && (
            <a
              title="Twitter"
              href={social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-blue-500"
            >
              <FaTwitter size={24} />
            </a>
          )}
          {social.discord && (
            <a
              title="Discord"
              href={social.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-indigo-500"
            >
              <FaDiscord size={24} />
            </a>
          )}
        </div>
        <p className="text-sm">
          Email:{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="text-gray-100 hover:underline"
          >
            {contactEmail}
          </a>
        </p>
        <p className="text-sm">
          Created by{" "}
          <a
            href={creator.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:underline"
          >
            {creator.name}
          </a>
        </p>
        <p className="text-sm">
          Inspired by{" "}
          <a
            href={inspiration.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 hover:underline"
          >
            {inspiration.name}
          </a>
        </p>
      </div>
    </footer>
  );
}
