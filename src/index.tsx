import { Form, ActionPanel, Action, showToast, LaunchProps, popToRoot } from "@raycast/api";
import { useEffect, useRef, useState } from "react";
import { homedir } from "os";
import { readFile } from "fs/promises";
import snarkdown from "snarkdown";
import { join } from "path";
import PileOperations from "./utils/fileOperations";
import { PileSettings } from "./utils/types";

interface PostValues {
  title: string;
  description?: string;
  thought?: string;
  dueDate?: Date;
  pile?: PileSettings;
}

const defaultPost = {
  content: "",
  data: {
    title: "",
    createdAt: null,
    updatedAt: null,
    highlight: null,
    highlightColor: null,
    tags: [],
    replies: [],
    attachments: [],
    isReply: false,
    isAI: false,
  },
};

export default function Command(props: LaunchProps<{ draftValues: PostValues }>) {
  const { draftValues } = props;

  const [thought, setThought] = useState<string>(draftValues?.thought || "");
  const [piles, setPiles] = useState<PileSettings[]>([]);
  const [pile, setPile] = useState<PileSettings | null>(draftValues?.pile || null);

  const pilesRef = useRef<PileSettings[] | null>(null);

  useEffect(() => {
    getPiles();
  }, []);

  async function getPiles() {
    const filePath = join(homedir(), "Piles", "piles.json");
    const data = PileOperations.readFile(filePath) as Promise<string>;
    const tempData = await data;
    setPiles(JSON.parse(tempData.toString()));
    pilesRef.current = JSON.parse(tempData.toString());
  }

  async function savePost() {
    const data = {
      ...defaultPost.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    // Convert markdown to html
    const html = snarkdown(thought);
    try {
      const fileContents = PileOperations.generateMarkdownFile(html, data || "");
      await PileOperations.saveFile(pile?.path || "", fileContents);
      await PileOperations.addFileToIndex(pile?.path || "", data);
    } catch (error) {}
  }

  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action
            title="Create Post"
            onAction={async () => {
              await savePost();
              popToRoot();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea id="thought" title="What are you thinking?" value={thought} onChange={setThought} />
      <Form.Dropdown
        id="dropdown"
        title="Pile"
        value={pile?.name || "Select a pile"}
        onChange={(value: string) => {
          setPile(piles?.find((pile: PileSettings) => pile.name === value) || null);
        }}
      >
        {pilesRef?.current &&
          pilesRef?.current?.map((pile: PileSettings, index: number) => (
            <Form.Dropdown.Item value={pile.name} title={pile.name} key={index} />
          ))}
      </Form.Dropdown>
    </Form>
  );
}
