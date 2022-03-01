import { ChangeEvent, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "react-query";
import moment from "moment";
import { CalendarTypeProps } from "../../types/type";
import DateComponent from "../../components/Calendar";
import { changeToDate } from "../../utils/formatDateMoment";
import { Button, Input, Select, Modal, Alert } from "@mantine/core";
import { AuthContext } from "../../context/AuthContext";

type LocationState = {
  id: string;
  name: string;
};
type PutQuota = {
  id: string | undefined;
  quota: number;
  token: string | null;
};
type ModalUpdate = {
  isOpen: boolean;
  setIsOpen: (arg: boolean) => void;
  filteredCalendar: CalendarTypeProps | undefined;
  updateQuota: (arg: number) => void;
  isError: boolean;
};

const fetchCategory = async () => {
  const { data } = await axios.get(`${process.env.REACT_APP_API_KEY}/offices/`);
  return data.data;
};

const getCalendar = async (category: LocationState | undefined) => {
  if (category) {
    const { data: response } = await axios.get(
      `${process.env.REACT_APP_API_KEY}/days/`,
      {
        params: {
          office_id: category.id,
        },
      }
    );

    return response.data;
  }
};

const putQuota = async (dayUpdate: PutQuota) => {
  const { token, id, quota } = dayUpdate;
  const response = await axios.post(
    `${process.env.REACT_APP_API_KEY}/days/`,
    { id: id, quota: quota },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const ModalUpdateQuota = ({
  isOpen,
  setIsOpen,
  filteredCalendar,
  updateQuota,
  isError,
}: ModalUpdate) => {
  const [isQuota, setIsQuota] = useState<number>(0);
  const date = moment(filteredCalendar?.date).format("DD MMMM YYYY");
  return (
    <>
      <Modal
        title="Quota Work From Office"
        centered
        styles={{
          header: { paddingLeft: 20, paddingRight: 20, paddingTop: 10 },
          modal: { padding: 0 },
        }}
        opened={isOpen}
        onClose={() => setIsOpen(false)}
      >
        {filteredCalendar && (
          <>
            <div className="bg-blue-100 w-full flex flex-col justify-between py-4">
              {isError && (
                <div className="my-2">
                  <Alert title="Failed :(" color="red">
                    Something wrong...
                  </Alert>
                </div>
              )}
              <div className="mx-4 flex flex-row">
                <div className="w-1/2">
                  <label className="text-sm">Date</label>
                  <p className="font-semibold">{date}</p>
                </div>
                <div className="w-1/2">
                  <label className="text-sm">Location</label>
                  <p className="font-semibold">{filteredCalendar.office}</p>
                </div>
              </div>
            </div>
            <div className="mx-4">
              <div className="my-3 flex flex-col gap-y-2">
                <h1>Quota WFO</h1>
                <div className="w-1/4">
                  <Input
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setIsQuota(+e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="py-4 flex justify-end gap-x-4">
                <Button variant="outline">Back</Button>
                <Button onClick={() => updateQuota(isQuota)}>
                  Update Qouta
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

const DashboardAdmin = () => {
  const queryClient = useQueryClient();
  const [filteredCategory, setFilteredCategory] = useState<
    LocationState | undefined
  >();
  const [filteredCalendar, setFilteredCalendar] = useState<
    CalendarTypeProps | undefined
  >();
  const [isLocation, setIsLocation] = useState<LocationState[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSucces, setIsSucces] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  // Responsive Calendar
  const isDekstop = useMediaQuery("(min-width: 1200px)");
  const isTablet = useMediaQuery("(max-width: 1200px)");
  const isMobile = useMediaQuery("(max-width: 600px)");
  const { data } = useQuery("getCategory", fetchCategory);
  const { data: dataCalendar, refetch } = useQuery("getDataCalendar", () =>
    getCalendar(filteredCategory)
  );
  const mutation = useMutation(putQuota, {
    onSuccess: async (data) => {
      setIsOpen(false);
      setIsError(false);
      setIsSucces(true);
      setTimeout(() => {
        setIsSucces(false);
      }, 1500);
      queryClient.invalidateQueries(["getDataCalendar", data.id]);
    },
    onError: async () => {
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, 1000);
    },
  });

  const { state } = useContext(AuthContext);
  const { token } = state;
  const updateQuota = async (quota: number) => {
    const dayUpdate = {
      id: filteredCalendar?.id,
      token: token,
      quota: +quota,
    };
    await mutation.mutate(dayUpdate);
  };
  const dataLocation =
    isLocation &&
    isLocation.map((location: LocationState) => ({
      value: `${location.id}`,
      label: `${location.name}`,
    }));

  useEffect(() => {
    if (data) {
      setIsLocation(data);
    }
    if (isLocation[0]) {
      setFilteredCategory({
        name: isLocation[0].name,
        id: isLocation[0].id,
      });
    }
  }, [data, isLocation]);

  const handleChangeOffice = (e: string) => {
    const category = isLocation.filter(
      (location: LocationState) => location.id === e
    );
    setFilteredCategory({
      name: category[0].name,
      id: category[0].id,
    });
    setTimeout(() => {
      refetch();
    }, 300);
  };
  const handleChangeCalendar = (e: Date) => {
    if (dataCalendar) {
      const filteredCalendars = dataCalendar.filter(
        (calendar: CalendarTypeProps) =>
          changeToDate(calendar.date) === changeToDate(e)
      );

      if (filteredCalendars.length > 0) {
        setIsOpen(true);
        setFilteredCalendar({
          id: filteredCalendars[0].id,
          date: filteredCalendars[0].date,
          office: filteredCalendars[0].office,
          quota: filteredCalendars[0].Quota,
        });
      }
    }
  };

  return (
    <div>
      <ModalUpdateQuota
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        filteredCalendar={filteredCalendar}
        updateQuota={updateQuota}
        isError={isError}
      />
      <div className="lg:w-1/3 my-2">
        <h1 className="font-semibold">Office</h1>
        {dataLocation && (
          <Select
            label="Select which office"
            placeholder="Pick one"
            onChange={handleChangeOffice}
            data={dataLocation}
          />
        )}
      </div>
      {isSucces && (
        <div className="my-2">
          <Alert title="Success!" color="blue">
            Your update Quota succesfully...
          </Alert>
        </div>
      )}
      {isError && (
        <div className="my-2">
          <Alert title="Failed!" color="red">
            Your update Quota Failed...
          </Alert>
        </div>
      )}
      <div className="flex justify-center py-8">
        <DateComponent
          data={dataCalendar}
          onHandle={handleChangeCalendar}
          isMobile={isMobile}
          isTablet={isTablet}
          isDesktop={isDekstop}
          isQuota={true}
        />
      </div>
    </div>
  );
};

export default DashboardAdmin;
