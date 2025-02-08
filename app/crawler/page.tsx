import { listFolders } from "../services/crawler";

export default async function Home() {
  await listFolders()
  
 
  return (
    <p>Runs Crawlers</p>
  );
}