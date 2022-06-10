# flamingos_sdc_qa_db
# QA

QA supports the SuperNova shopping app by handling queries for Questions and Answers.

## Installation

### Pre Instillation Requirements
```
node v16.15.0
yarn v1.22.18
```
## Environment Variables

QA uses [dotenv](https://www.npmjs.com/package/dotenv)

Update the Port and Auth variables in the `example.env`file found in the main directory.

1. Install dependencies"
  ```
  yarn install
  ```
2. Start Development Server:
  ```
  yarn server-dev
  ```

Created db using pgadmin. The following are screenshots on the structure and proof the data is in the tables.
![answers_table](https://user-images.githubusercontent.com/100874788/172733657-f2111724-8378-4094-be98-d3142e96f533.png)
![photos_table](https://user-images.githubusercontent.com/100874788/172733665-4754e9a0-0939-46d0-8beb-2cd05636f742.png)
![questions_table](https://user-images.githubusercontent.com/100874788/172733676-bf10a116-9dcd-4661-a31c-2971e14de24c.png)
![Screen Shot 2022-06-08 at 6 20 07 PM](https://user-images.githubusercontent.com/100874788/172733681-44aa6b70-f0f2-4077-bf46-c7ce10ba9901.png)
