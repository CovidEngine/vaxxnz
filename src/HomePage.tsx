import { FunctionComponent } from "react";
import { PageLink } from "./PageLink";
import { useTranslation } from "react-i18next";

export enum TabType {
  walkIn,
  bookings,
}

interface TabsProps {
  activeTab: TabType;
}

export const Tabs: FunctionComponent<TabsProps> = ({ activeTab }) => {
  const { t } = useTranslation("common");
  return (
    <div className="styled-tabs">
      <PageLink
        role="tablist"
        aria-label={"Walk in vaccination"}
        to="/locations"
      >
        <Tab isActive={activeTab === TabType.walkIn} disabled={false}>
          {t("core.walkInDriveThru")}
        </Tab>
      </PageLink>
      <PageLink role="tablist" aria-label={"Book a vaccination"} to="/bookings">
        <Tab isActive={activeTab === TabType.bookings} disabled={true}>
          {t("core.makeABooking")}
        </Tab>
      </PageLink>
    </div>
  );
};

interface TabProps {
  isActive: boolean;
  disabled: boolean;
}

const Tab: FunctionComponent<TabProps> = ({ isActive, children, disabled }) => (
  <button
    className="styled-tab"
    role="tab"
    aria-selected={isActive}
    disabled={disabled}
  >
    {children}
  </button>
);
