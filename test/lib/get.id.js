// deterministic UUIDv4 values to use for order ids when running tests

let index = 0;
const uuids = [
  '35981610-d930-40dc-8ca9-afc784b63f1c',
  '325631b9-7263-4ea7-9ac4-5b93a9080921',
  '2261715f-6aa5-4b11-82e1-28e726a05009',
  '5e3d57d0-cf39-497e-9aa7-df90a3d911cd',
  'abe3f70d-dc2b-420b-99df-7311709101ff',
  'b4e023ef-9456-4a9c-b730-093702f5ff69',
  '252a5f2a-c95a-4fbc-8191-e2c6107e7d43',
  '8091b569-6713-4d91-b168-7c442ed4828b',
  'c9ca8cd4-1160-4eab-a513-cf384b235b86',
  'fcf959ae-374c-4bd4-bace-666171939dc5',
  '45ddc4eb-88c3-4d41-b0b6-7a46e8e93679',
  'c3003fb4-b371-4ee2-8eb2-5b152a761189',
  '4f82cd05-8ad5-460b-a5c5-636b5113bc89',
  '5dfe2666-da52-4350-bf0e-826de8376f6a',
  '6714510b-189d-40b0-a28a-c656e91b9e30',
  '28a1d24a-86f0-403b-88da-8e983d467933',
  'd129a0b9-44ff-4fa1-9308-c65e52fced57',
  '6f4a4994-6066-499e-bcd7-ef7fbe47affc',
  '39412fce-1f90-4a10-8c2f-cc125eaac20d',
  '78347db9-e574-47bd-9555-7f9cd85502f3',
  '64bf0420-bee1-4e39-80d4-355c6e00b06c',
  '380ddd3c-8e91-4deb-9d4b-2b2792b0e28f',
  'd8b5861d-9e0b-4efd-b3f8-2a9c2a34f76f',
  '3ee72c26-7339-437f-84f7-be2c69c0463e',
  '9b516bd7-cd12-412c-a3f7-970cdb9ce5a5',
  '11a8fb25-99a7-4643-bc03-47382a852dd6',
  '481e8ce6-5a23-43e7-a5a6-0df0bcee473d',
  'ea71bc64-32cd-48f9-a248-cf4151e1e38e',
  '846c9757-df33-4620-a23b-bd8581ca98c8',
  'ec24e63d-0f6e-4e86-a4c8-f12d66a63cf8',
  '14d66cdf-e9ce-40ab-a9c6-cb4920af1694',
  'a361f82a-5697-4f74-b786-38701fb0d8a5',
  'b1910eaa-ad60-449f-b52e-52ea51dfe6b5',
  'a8f021b7-f749-421d-883f-5309d83edfba',
  '00f6b8ea-fd0c-45a4-aea9-4a7b8d6d64b2',
  '00885bb1-872a-4602-81fc-609f283ba07e',
  '0d509d27-0b34-4836-ab9d-7617867835f2',
  '515baceb-0021-4212-ae88-2e92dbaf2355',
  'da205d01-9367-4e01-8db8-c696e7eec065',
  '55836be9-1bfd-423f-93ab-b628bd7fd182',
  '3e2a0865-3715-4b9d-a7de-d2de1bc5128e',
  '75a50b14-3064-41fd-837b-249a275869b1',
  '2f395575-0ed9-4b83-a243-3c77497e545d',
  '215d296f-0fd6-4308-a59b-290e4be15ee7',
  '7e0c3030-f942-49ff-809e-25edae6462f6',
  'f629b7aa-9f56-4dbb-97d5-35b71222277e',
  '62438168-a92e-4c6a-8259-ad52673f406e',
  '87f17044-2fcd-4bcc-bc76-6ddc549cea14',
  '46f9dc47-f9d0-436d-8202-78ed0fd5dc7c',
  'b8d75083-eada-41fc-a1f1-4cdcf9f24d41',
];

module.exports = () => {
  if (index > uuids.length - 1) index = 0;
  const uuid = uuids[index];
  index++;
  return uuid;
};
