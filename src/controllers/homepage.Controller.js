import { getHomepageContent, updateHomepageContent, updateHomepageSectionImage } from "../services/homepage.Service.js";
import { uploadImage } from "../services/imageUpload.Service.js";

export const getHomepage = async (_req, res) => {
  try {
    const content = await getHomepageContent();
    return res.status(200).json({ success: true, data: content });
  } catch (error) {
    console.error("Get homepage content error:", error);
    return res.status(500).json({ success: false, message: "Unable to load homepage content" });
  }
};

export const updateHomepage = async (req, res) => {
  try {
    const { hero, stats, about, whyChoose, cta, footer } = req.body;

    if (!hero || typeof hero !== "object" || !Array.isArray(stats)) {
      return res.status(400).json({ success: false, message: "Hero content and stats are required" });
    }

    if (stats.some((stat) => !stat.label?.trim() || !Number.isFinite(Number(stat.value)))) {
      return res.status(400).json({ success: false, message: "Each stat needs a label and numeric value" });
    }

    const content = await updateHomepageContent({
      hero,
      about: about || {},
      whyChoose: whyChoose || {},
      cta: cta || {},
      footer: footer || {},
      stats: stats.map((stat) => ({
        value: Number(stat.value),
        suffix: typeof stat.suffix === "string" ? stat.suffix.trim() : "",
        label: stat.label.trim(),
        icon: typeof stat.icon === "string" ? stat.icon : "Building",
      })),
    });

    return res.status(200).json({ success: true, message: "Homepage content updated", data: content });
  } catch (error) {
    console.error("Update homepage content error:", error);
    return res.status(500).json({ success: false, message: "Unable to update homepage content" });
  }
};

export const uploadHomepageSectionImage = async (req, res) => {
  try {
    const { section } = req.params;

    if (!new Set(["about", "whyChoose"]).has(section)) {
      return res.status(400).json({ success: false, message: "Unsupported homepage image section" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "An image file is required" });
    }

    const image = await uploadImage(req.file, `echohome/homepage/${section}`);
    const content = await updateHomepageSectionImage(section, image);

    return res.status(200).json({ success: true, message: "Homepage image uploaded", data: content });
  } catch (error) {
    console.error("Upload homepage section image error:", error);

    if (error.message === "CLOUDINARY_NOT_CONFIGURED") {
      return res.status(500).json({ success: false, message: "Image uploads are not configured on the server" });
    }

    return res.status(500).json({ success: false, message: "Unable to upload homepage image" });
  }
};
