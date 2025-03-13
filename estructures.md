id | name | folder_id_img | parent_name | parent_id | created_at | updated_at
X | natal 2023 | X | keiti e diogo | XParent | 2025-03-13 10:00:00 | 2025-03-13 10:00:00




Folders:
{
  "_id": "ObjectId",
  "name": "Natal 2023",
  "parentId": "ObjectId", // Referência à pasta pai
  "photosFolderId": "folderIdDasFotos", // ID da pasta que contém as fotos
  "imageId": "ObjectId", // ID da imagem que representa a pasta
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
  "usersIds": ["ObjectId", "ObjectId"] // IDs dos usuários que podem acessar a pasta
}

Users:
{
  "_id": "ObjectId",
  "username": "user123",
  "passwordHash": "hashedPassword",
  "folderAccess": [
    "ObjectId", // IDs das pastas que o usuário pode acessar
    "ObjectId"
  ]
}

Selections Photos: // Ao selecionar no painel que está pasta será para selecionar as fotos, entao cria está collection com o id da pasta e os ids das fotos vazias, assim que o usuario selecionar as fotos, atualiza a collection com os ids das fotos selecionadas (photosIds). Temos que ter tambem um limite de quantidade de fotos que o usuario pode selecionar. Uma para mostrar as que não foram selecionadas. Se já foi selecionado,
{
  "_id": "ObjectId",
  "folderId": "ObjectId", // ID da pasta que contém as fotos
  "limitPhotos": 10, // Limite de fotos que o usuário pode selecionar
  "photosIds": [
    {
      "photoId": "ObjectId",
      "selectedDate": "timestamp"
    }
  ], // IDs das fotos selecionadas
  "photosNotSelectedIds": ["ObjectId", "ObjectId"], // IDs das fotos não selecionadas
  "alreadySelected": false, // Se já foi selecionado ou não
  "usersIds": ["ObjectId", "ObjectId"], // IDs dos usuários que podem acessar as fotos
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
} 