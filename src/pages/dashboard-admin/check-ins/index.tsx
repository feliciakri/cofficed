import { useContext, useEffect, useState, ChangeEvent } from "react";
import {
  Menu,
  Divider,
  Pagination,
  Table,
  Modal,
  Button,
  Input,
  LoadingOverlay,
  Loader,
  RadioGroup,
  Radio,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "react-query";
import moment from "moment";
import axios, { AxiosError, AxiosResponse } from "axios";
import { AuthContext } from "../../../context/AuthContext";
import {
  Check,
  List,
  SortAscending,
  SortDescending,
  XCircle,
} from "phosphor-react";
import { useNotifications } from "@mantine/notifications";
import { AttendancesProps } from "../../../types/type";

type PropsTable = {
  attends: AttendancesProps;
};
type ModalRequestProps = {
  attends: AttendancesProps;
  mutation?: any;
  token: string | null;
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
};
type ApprovedPost = {
  id: string;
  token: string | null;
  status: string;
  notes?: string;
};

const postStatusAttends = async (approved: ApprovedPost) => {
  const { token, id, status, notes } = approved;

  const response = await axios
    .put(
      `${process.env.REACT_APP_API_URL}/attendances/`,
      { id: id, status: status, notes: notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response: AxiosResponse) => {
      return response;
    })
    .catch((error: AxiosError) => {
      return error.response?.data?.meta.message;
    });

  return response;
};

const ModalRequest = ({
  attends,
  mutation,
  token,
  isOpen,
  setIsOpen,
}: ModalRequestProps) => {
  const [valueStatus, setValueStatus] = useState<string>("approved");
  const [isDescription, setIsDescription] = useState<string>();
  const { id, office, employee, nik } = attends;

  const handleRequest = async () => {
    const approved = {
      id: id,
      token: token,
      notes: isDescription ? isDescription : "",
      status: valueStatus,
    };
    await mutation.mutate(approved);
    setTimeout(() => {
      setIsDescription("");
    }, 300);
  };

  return (
    <Modal
      title="Request Work from Office"
      centered
      styles={{
        header: { paddingLeft: 20, paddingRight: 20, paddingTop: 10 },
        modal: { padding: 0 },
      }}
      opened={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <>
        <div className="flex flex-row justify-between bg-blue-100 px-4 text-sm">
          <div className="w-1/2 flex flex-col py-4">
            <h1>Office Location</h1>
            <p className="font-semibold">{office}</p>
          </div>
        </div>
        <div className="m-4">
          <div className=" p-2 border rounded-md flex flex-row justify-between text-sm">
            <div className="w-1/2 flex flex-col">
              <h1>Name</h1>
              <p className="font-semibold">{employee}</p>
            </div>
            <div className="w-1/2 flex flex-col">
              <h1>NIK</h1>
              <p className="font-semibold">{nik}</p>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <div>
              <RadioGroup
                value={valueStatus}
                onChange={setValueStatus}
                color="dark"
                className="flex justify-center py-3"
                required
              >
                <Radio value="approved" className="border p-2">
                  Approve
                </Radio>

                <Radio value="rejected" className="border p-2">
                  Reject
                </Radio>
              </RadioGroup>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-y-1 text-sm my-3">
            <label className="font-semibold">Description</label>
            <Input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setIsDescription(e.target.value)
              }
            />
          </div>

          <div className="py-4 flex justify-end gap-x-4">
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Back
            </Button>
            <Button type="button" onClick={handleRequest}>
              Confirm
            </Button>
          </div>
        </div>
      </>
    </Modal>
  );
};
const TableAdmin = ({ attends }: PropsTable) => {
  const queryClient = useQueryClient();
  const { state } = useContext(AuthContext);
  const { token } = state;
  const notifications = useNotifications();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { id, office, employee, status, user_avatar, user_email } = attends;

  // style by status
  const styleApproved = status.toLocaleLowerCase() === "approved";
  const styleRejected = status.toLocaleLowerCase() === "rejected";
  const stylePending = status.toLocaleLowerCase() === "pending";
  const mutation = useMutation(postStatusAttends, {
    onSuccess: (data) => {
      queryClient.invalidateQueries("allAttendence");
      queryClient.invalidateQueries("attendenceByRange");
      setIsOpen(false);
      notifications.showNotification({
        title: "Success",
        message: "Change Status Request is Successfully",
        icon: <Check size={20} />,
      });
    },
    onError: async (data: any) => {
      notifications.showNotification({
        title: "Failed",
        color: "red",
        message: `${data}`,
        icon: <XCircle className="text-white" size={32} />,
      });
    },
  });

  const handleStatus = async (e: string) => {
    const approved = {
      id: id,
      token: token,
      status: e,
    };
    await mutation.mutate(approved);
  };

  return (
    <>
      <ModalRequest
        attends={attends}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        token={token}
        mutation={mutation}
      />
      <tr className="bg-white text-gray-900">
        <td className="capitalize flex flex-row space-x-2 items-center">
          <img
            src={`${
              user_avatar ? user_avatar : "/apple-touch-icon.png"
            }?${Date.now()}`}
            alt="logo"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex flex-col">
            <p>{employee}</p>
            <p>{user_email}</p>
          </div>
        </td>
        <td className="font-semibold">{office}</td>
        <td>
          <span
            className={` ${
              styleApproved
                ? "bg-green-200 text-green-900"
                : styleRejected
                ? "bg-red-200 text-red-900"
                : stylePending
                ? "bg-gray-200 text-gray-900"
                : ""
            } p-0.5 px-3 rounded-t-full rounded-b-full capitalize`}
          >
            {status}
          </span>
        </td>
        <td>
          <Menu control={<List size={20} />}>
            <Menu.Item onClick={() => handleStatus("approved")}>
              Approve
            </Menu.Item>
            <Menu.Item onClick={() => handleStatus("rejected")}>
              Reject
            </Menu.Item>
            <Divider />
            <Menu.Item onClick={() => setIsOpen(true)}>Details</Menu.Item>
          </Menu>
        </td>
      </tr>
    </>
  );
};

const getAttendances = async (token: string | null) => {
  if (token) {
    const data = await axios.get(
      `${process.env.REACT_APP_API_URL}/attendances/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  }
};
const DashboardAdminCheckIns = () => {
  const { state } = useContext(AuthContext);
  const { token } = state;

  const [isAttendences, setIsAttendences] = useState<AttendancesProps[]>();
  const [activePage, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const tablePerPage = 6;
  const [isEmployee, setIsEmployee] = useState<AttendancesProps[]>();
  // range date, whether to use?

  const [filteredByOrder, setFilteredByOrder] = useState<boolean>(false);

  const { isLoading, data, refetch, isFetching } = useQuery(
    "allAttendence",
    () => getAttendances(token)
  );

  useEffect(() => {
    if (data) {
      setIsEmployee(data.data.data);
    }

    if (isEmployee) {
      const num = Math.ceil(isEmployee.length / tablePerPage);
      setTotalPage(num);
      const dataAttends = isEmployee.slice(
        (activePage - 1) * tablePerPage,
        activePage * tablePerPage
      );
      setIsAttendences(dataAttends);
    }
  }, [data, activePage, isEmployee]);

  const handleFilterBySort = () => {
    setFilteredByOrder(!filteredByOrder);
    setTimeout(() => {
      refetch();
    }, 200);
  };

  return (
    <>
      <div className="py-5 font-inter">
        <h1 className="text-xl font-fraunces">Employee Check Ins</h1>

        <div className="flex flex-row items-center justify-between py-4">
          <p>Employee not yet checked in today</p>
          <button
            className="rounded-r-xl border-2 h-full px-2 text-sm flex flex-row gap-x-2 items-center cursor-pointer transition duration-150 transform hover:scale-105 hover:bg-white"
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

        {isLoading && <LoadingOverlay visible={true} />}
        {isFetching && (
          <div className="flex justify-end">
            <Loader size="sm" />
          </div>
        )}

        <div className="overflow-x-auto border shadow-md first-letter:rounded-t-lg rounded-t-lg">
          <Table verticalSpacing="xs">
            <thead className="bg-gray-50">
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isAttendences?.map((data: AttendancesProps, i: number) => (
                <TableAdmin attends={data} key={i} />
              ))}
            </tbody>
          </Table>
        </div>
        <div className="flex mt-8 justify-center">
          <Pagination
            page={activePage}
            onChange={setPage}
            total={totalPage}
            color="cyan"
          />
        </div>
      </div>
    </>
  );
};

export default DashboardAdminCheckIns;
