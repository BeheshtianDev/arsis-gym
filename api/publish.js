export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const token = process.env.GITHUB_TOKEN;

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!token || !owner || !repo) {
      return res.status(500).json({
        ok: false,
        error: "GitHub environment variables are not configured.",
      });
    }

    const content =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!content || typeof content !== "object") {
      return res.status(400).json({
        ok: false,
        error: "Invalid content.",
      });
    }

    const filePath = "dist/content.json";

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    /*
     * First get the existing file so we can obtain its SHA.
     */
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      {
        headers,
      },
    );

    if (!getResponse.ok) {
      const errorText = await getResponse.text();

      return res.status(500).json({
        ok: false,
        error: "Could not read existing GitHub file.",
        details: errorText,
      });
    }

    const existingFile = await getResponse.json();

    const json = JSON.stringify(content, null, 2) + "\n";

    const encodedContent = Buffer.from(json, "utf8").toString("base64");

    /*
     * Update the file and create a Git commit.
     */
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: "Update gym content from editor",
          content: encodedContent,
          sha: existingFile.sha,
          branch,
        }),
      },
    );

    const result = await updateResponse.json();

    if (!updateResponse.ok) {
      return res.status(updateResponse.status).json({
        ok: false,
        error: "GitHub update failed.",
        details: result,
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Content published successfully.",
      commit: result.commit?.html_url || null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error.message || "Internal server error.",
    });
  }
}
