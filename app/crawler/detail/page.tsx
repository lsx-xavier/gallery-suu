'use client';
export default function Home() {
  // const onClick = async () => {
  //   try {
  //     // Fazer fetch do arquivo compactado
  //     const response = await fetch("/drive_structure.gzip");
  //     const compressedData = await response.arrayBuffer();

  //     // Criar um blob e descompactar usando o navegador
  //     const ds = new DecompressionStream("gzip");
  //     const stream = new Response(compressedData).body!.pipeThrough(ds);
  //     const decompressedArrayBuffer = await new Response(stream).arrayBuffer();

  //     // Converter para JSON
  //     const json = JSON.parse(new TextDecoder().decode(decompressedArrayBuffer));

  //     console.log(json);

  //   } catch (error) {
  //     console.error("Erro ao carregar JSON:", error);
  //   }
  // };
  const onClick = async () => {
    try {
      // Fazer fetch do arquivo compactado
      const response = await fetch(
        `/api/get-images-from?targetFolder=natal 2023&parentFolder=keiti e diogo`,
      ).then((resp) => resp.json());
    } catch (error) {
      console.error('Erro ao carregar JSON:', error);
    }
  };

  return <button onClick={() => onClick()}>Show the json</button>;
}
