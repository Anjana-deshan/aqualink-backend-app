import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: "di8rc2p4j",
  api_key: "545319679217715",
  api_secret: "G_NOCHx5BnF10C7EIJQRwspvGrs",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fish_stock", // optional folder in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const upload = multer({ storage });
