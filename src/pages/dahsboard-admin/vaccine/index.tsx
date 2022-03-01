import {
  LoadingOverlay,
  Modal,
  RadioGroup,
  Radio,
  Table,
  Button,
} from "@mantine/core";
import axios from "axios";
import { Check, SortAscending, SortDescending, X } from "phosphor-react";
import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AuthContext } from "../../../context/AuthContext";

type CertificateType = {
  admin: string;
  dosage: number;
  user: string;
  image: string;
  status: string;
  id: string;
};

type UserCertificate = {
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_email: string;
  certificates: CertificateType[];
};

type Tables = {
  certificate: UserCertificate;
};
type ModalProps = {
  opened: boolean;
  setOpened: (arg: boolean) => void;
  certificate: CertificateType;
};
type PutType = {
  token: string | null;
  status: string;
  id: string;
};

const putCertificate = async (data: PutType) => {
  const { token, status, id } = data;
  const response = await axios.put(
    `${process.env.REACT_APP_API_KEY}/certificates/${id}`,
    { status: status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response;
};
const ModalCertificate = ({ opened, setOpened, certificate }: ModalProps) => {
  const queryClient = useQueryClient();
  const { user, image, dosage, id } = certificate;
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [value, setValue] = useState("approved");

  const mutation = useMutation(putCertificate, {
    onSuccess: async (data: any) => {
      setOpened(false);
      queryClient.invalidateQueries(["getAllCertificate", data.id]);
    },
  });
  const handleCertificate = async () => {
    const data = {
      id: id,
      status: value,
      token: token,
    };
    await mutation.mutate(data);
  };
  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={`Certificate Vaccine ${user}`}
      styles={{
        header: { paddingLeft: 20, paddingRight: 20, paddingTop: 10 },
        modal: { padding: 0 },
      }}
    >
      <div className="bg-blue-100 px-4 w-full flex flex-row justify-between py-4">
        <h1>Certificate vaccine: {dosage}</h1>
      </div>
      <div className="mx-4 py-2">
        <img
          src={image}
          alt="img vaccine"
          className="h-64 w-full bg-cover rounded-md"
        />
        <div>
          <RadioGroup
            value={value}
            onChange={setValue}
            color="dark"
            className="flex justify-center py-3"
            required
          >
            <Radio value="approved" className="border p-2">
              Approved
            </Radio>

            <Radio value="rejected" className="border p-2">
              Rejected
            </Radio>
          </RadioGroup>
        </div>
      </div>
      <div className="px-4 py-4 flex justify-end gap-x-4">
        <Button variant="outline" onClick={() => setOpened(false)}>
          Back
        </Button>
        <Button onClick={handleCertificate}>Save</Button>
      </div>
    </Modal>
  );
};
const TableAdminVaccine: React.FC<Tables> = ({ certificate }) => {
  const { user_avatar, user_email, user_name, certificates } = certificate;
  const isCompletedVaccine =
    certificates.filter((data: CertificateType) => data.status === "approved")
      .length === 3;

  const [opened, setOpened] = useState<boolean>(false);
  const isCertificates = certificates.length > 0;
  return (
    <>
      <tr className="bg-white text-gray-900">
        <td className="capitalize flex flex-row space-x-2 items-center">
          <img
            src={user_avatar}
            alt="logo"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <p>{user_name}</p>
            <p>{user_email}</p>
          </div>
        </td>
        <td className="w-1/6">
          <div className="flex items-center relative gap-x-2">
            {certificates.map((data: CertificateType, i: number) => (
              <div key={i}>
                <ModalCertificate
                  opened={opened}
                  setOpened={setOpened}
                  certificate={data}
                />
                <div
                  className={`${
                    data.status === "pending"
                      ? "bg-gray-500"
                      : data.status === "approved"
                      ? "bg-indigo-600"
                      : data.status === "rejected"
                      ? "bg-red-600"
                      : ""
                  } rounded-full transition duration-500 ease-in-out h-10 w-10 py-3 flex items-center justify-center  cursor-pointer text-white`}
                  onClick={() => setOpened(true)}
                >
                  {data.status === "approved" && (
                    <Check size={22} className="text-white" />
                  )}
                  {data.status === "pending" && <p>{data.dosage}</p>}
                  {data.status === "rejected" && (
                    <X size={22} className="text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {!isCertificates && <p>no certificate</p>}
        </td>
        <td className="lg:w-1/6">
          <div
            className={`${
              isCompletedVaccine
                ? "bg-green-200 text-green-900"
                : "bg-red-200 text-red-900"
            } p-0.5 px-3 rounded-t-full rounded-b-full capitalize text-center`}
          >
            {isCompletedVaccine ? "Completed" : "Not Completed"}
          </div>
        </td>
      </tr>
    </>
  );
};

type AllCertificateProps = {
  token: string | null;
  order_by: string;
};
const getAllCertificate = async ({ token, order_by }: AllCertificateProps) => {
  if (token) {
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_KEY}/certificates/`,
      {
        params: {
          order_by: order_by,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }
};
const DashboardAdminVaccine = () => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [filteredByOrder, setFilteredByOrder] = useState<boolean>(false);
  const { data, isLoading, refetch } = useQuery("getAllCertificate", () =>
    getAllCertificate({
      token: token,
      order_by: filteredByOrder ? "asc" : "desc",
    })
  );
  const handleFilterBySort = () => {
    setFilteredByOrder(!filteredByOrder);
    setTimeout(() => {
      refetch();
    }, 300);
  };
  if (isLoading) {
    <LoadingOverlay visible={isLoading} />;
  }
  return (
    <>
      <h1 className="font-fraunces text-2xl">Vaccine Certificate</h1>
      <div>
        <div className="flex justify-end py-2">
          <button
            className="rounded-r-xl border-2 h-full text-sm flex flex-row gap-x-2 items-center cursor-pointer transition duration-150 transform hover:scale-105 hover:bg-white px-2 py-1"
            onClick={handleFilterBySort}
          >
            {filteredByOrder ? (
              <SortAscending size={20} />
            ) : (
              <SortDescending size={20} />
            )}
            Sort
          </button>
        </div>
        <div className="overflow-x-auto border shadow-md first-letter:rounded-t-lg rounded-t-lg">
          <Table verticalSpacing="xs">
            <thead className="bg-gray-50">
              <tr>
                <th>
                  <p className="text-gray-500">Employee</p>
                </th>
                <th>
                  <p className="text-gray-500">Certificate</p>
                </th>
                <th>
                  <p className="text-gray-500">Status</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {data &&
                data.map((certificate: UserCertificate, i: number) => (
                  <TableAdminVaccine certificate={certificate} key={i} />
                ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default DashboardAdminVaccine;
