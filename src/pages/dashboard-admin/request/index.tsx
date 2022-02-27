import { useContext, useEffect, useState, ChangeEvent } from "react";
import {
  Menu,
  Divider,
  Pagination,
  Table,
  Modal,
  Button,
  Input,
  Select,
  LoadingOverlay,
  Loader,
  Chips,
  Chip,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { DateRangePicker } from "@mantine/dates";
import moment from "moment";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import {
  CalendarBlank,
  List,
  SortAscending,
  SortDescending,
} from "phosphor-react";

type AttendsProps = {
  id: string;
  office: string;
  employee: string;
  notes: string;
  admin: string;
  status: string;
  day: string;
  nik: string;
  user_avatar: string;
  user_email: string;
};
type PropsTable = {
  attends: AttendsProps;
};
type ModalRequstProps = {
  attends: AttendsProps;
  mutation?: any;
  token: string | null;
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
};
const postStatusAttends = async (approved: any) => {
  const { token, id, status, notes } = approved;
  const response = await axios.put(
    `${process.env.REACT_APP_API_KEY}/attendances/`,
    { id: id, status: status, notes: notes },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const ModalRequest = ({
  attends,
  mutation,
  token,
  isOpen,
  setIsOpen,
}: ModalRequstProps) => {
  const [valueStatus, setValueStatus] = useState<string | string[]>("approved");
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
            <h1>Location WFO</h1>
            <p className="font-semibold">{office}</p>
          </div>
          <div className="w-1/2 flex flex-col py-4">
            {/* from response data backend does not have quota  */}
            <h1>Quota tersisa</h1>
            <p className="font-semibold">3</p>
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
            <Chips
              size="md"
              spacing="xl"
              value={valueStatus}
              onChange={setValueStatus}
            >
              <Chip value="approved" radius="xl">
                Approved
              </Chip>
              <Chip value="rejected">Rejected</Chip>
            </Chips>
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { id, office, employee, status, day, user_avatar, user_email } =
    attends;
  const dateFormat = moment(day).format("LL");
  const timeFormat = moment(day).format("hh:mm");
  // style by status
  const styleApproved = status.toLocaleLowerCase() === "approved";
  const styleRejected = status.toLocaleLowerCase() === "rejected";
  const stylePending = status.toLocaleLowerCase() === "pending";
  const mutation = useMutation(postStatusAttends, {
    onSuccess: async (data) => {
      queryClient.invalidateQueries(["allAttendence", data.id]);
      setIsOpen(false);
    },
    onError: async () => {
      console.log("error");
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
        <td>
          <p className="text-sm text-gray-900">{dateFormat}</p>
          <p className="text-sm text-gray-500">{timeFormat}</p>
        </td>
        <td className="capitalize flex flex-row space-x-2 items-center">
          <img
            src={`${user_avatar ? user_avatar : "/apple-touch-icon.png"}`}
            alt="logo"
            className="w-10 h-10"
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
              Setujui permintaan
            </Menu.Item>
            <Divider />
            <Menu.Item onClick={() => handleStatus("rejected")}>
              Tolak Permintaan
            </Menu.Item>
            <Divider />
            <Menu.Item onClick={() => setIsOpen(true)}>Lihat detail</Menu.Item>
          </Menu>
        </td>
      </tr>
    </>
  );
};

type AttendProps = {
  token: string | null;
  status: string | undefined;
  order: string;
};
const getAllAttends = async (attend: AttendProps) => {
  if (attend.token) {
    const data = await axios.get(
      `${process.env.REACT_APP_API_KEY}/attendances/`,
      {
        params: {
          status: attend.status || "",
          order: attend.order || "",
        },
        headers: {
          Authorization: `Bearer ${attend.token}`,
        },
      }
    );
    return data;
  }
};
const DashboardAdminRequest = () => {
  const { state } = useContext(AuthContext);
  const { token } = state;
  const [isAttendences, setIsAttendences] = useState<AttendsProps[]>();
  const [activePage, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const tablePerPage = 6;
  const [isEmployee, setIsEmployee] = useState<AttendsProps[]>();
  const [filteredByStatus, setFilteredByStatus] = useState<
    string | undefined
  >();

  const [filteredByOrder, setFilteredByOrder] = useState<boolean>(false);
  const { isLoading, data, refetch, isFetching } = useQuery(
    "allAttendence",
    () =>
      getAllAttends({
        token: token,
        status: filteredByStatus,
        order: filteredByOrder ? "asc" : "desc",
      })
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

  const handleChange = (e: string) => {
    setFilteredByStatus(e);
    setTimeout(() => {
      refetch();
    }, 300);
  };

  const handleFilterBySort = () => {
    setFilteredByOrder(!filteredByOrder);
    setTimeout(() => {
      refetch();
    }, 300);
  };

  // range date, whether to use?
  const [isRange, setIsRange] = useState<[Date | null, Date | null]>();

  return (
    <>
      <div className="py-5 font-inter">
        <h1 className="text-xl font-fraunces">WFO Request</h1>
        <div className="flex flex-row items-center justify-between">
          <div className="w-1/3">
            <DateRangePicker
              placeholder="Pick dates range"
              value={isRange}
              rightSection={<CalendarBlank size={20} />}
              onChange={setIsRange}
            />
          </div>
          <div className="flex justify-end py-4 gap-x-2">
            <Select
              placeholder="Filter By Status"
              onChange={handleChange}
              data={[
                { value: "", label: "All" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
                { value: "pending", label: "Pending" },
              ]}
            />
            <div>
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
          </div>
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
                <th>Time</th>
                <th>Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {isAttendences &&
                isAttendences?.map((data: AttendsProps, i: number) => (
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

export default DashboardAdminRequest;
